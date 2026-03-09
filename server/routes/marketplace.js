/**
 * Marketplace Routes — /api/v1/marketplace
 *
 * Browse, list, buy, cancel NFTs using CRAFTS tokens.
 * Integrates with the CraftsMarketplace contract on Ethereum mainnet.
 */

const router = require('express').Router();
const { ethers } = require('ethers');
const { authRequired } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const { getProvider, getSigner, mapWeb3Error } = require('../services/web3Service');
const { getBalance } = require('../services/tokenService');
const { getTokenOwner, approveForMarketplace } = require('../services/nftContractService');
const logger = require('../utils/logger');

// ── Contract ABI (marketplace-specific functions) ────────────────────────────
const MARKETPLACE_ABI = [
    'function listItem(address nftAddress, uint256 tokenId, uint256 price) external',
    'function buyItem(address nftAddress, uint256 tokenId) external',
    'function cancelListing(address nftAddress, uint256 tokenId) external',
    'function updateListing(address nftAddress, uint256 tokenId, uint256 newPrice) external',
    'function getListing(address nftAddress, uint256 tokenId) external view returns (tuple(uint256 price, address seller))',
    'function getProceeds(address seller) external view returns (uint256)',
    'function withdrawProceeds() external',
    'function platformFeeBps() external view returns (uint256)',
    'function platformTreasury() external view returns (address)',
    'function getRoyalty(address nftAddress, uint256 tokenId) external view returns (tuple(address creator, uint256 percentBps))',
    'event ItemListed(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price)',
    'event ItemBought(address indexed buyer, address indexed nftAddress, uint256 indexed tokenId, uint256 price)',
    'event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId)',
];

/**
 * Get marketplace contract instance.
 * @param {boolean} [withSigner=false]
 */
function getMarketplaceContract(withSigner = false) {
    const address = process.env.CRAFTS_MARKETPLACE_ADDRESS;
    if (!address) throw new Error('CRAFTS_MARKETPLACE_ADDRESS not configured');
    const providerOrSigner = withSigner ? getSigner() : getProvider();
    return new ethers.Contract(address, MARKETPLACE_ABI, providerOrSigner);
}

// ── Swagger tag ──────────────────────────────────────────────────────────────
/**
 * @swagger
 * tags:
 *   - name: Marketplace
 *     description: NFT marketplace — list, buy, cancel, and browse listings in CRAFTS
 */

// ── GET /api/v1/marketplace — Browse marketplace ─────────────────────────────
/**
 * @swagger
 * /api/v1/marketplace:
 *   get:
 *     tags:
 *       - Marketplace
 *     summary: Browse marketplace listings
 *     description: Returns paginated, filterable marketplace items backed by database + on-chain state.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest, oldest]
 *           default: newest
 *     responses:
 *       200:
 *         description: Marketplace listings.
 *       500:
 *         description: Internal server error.
 */
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const { minPrice, maxPrice, genre, sort = 'newest' } = req.query;

        // Build Supabase query for listed NFTs
        let query = supabaseAdmin
            .from('marketplace_listings')
            .select('*', { count: 'exact' })
            .eq('status', 'active');

        if (minPrice !== undefined && !isNaN(Number(minPrice))) {
            query = query.gte('price_crafts', Number(minPrice));
        }
        if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
            query = query.lte('price_crafts', Number(maxPrice));
        }
        if (genre) {
            query = query.ilike('genre', `%${genre}%`);
        }

        // Sorting
        switch (sort) {
            case 'price_asc':
                query = query.order('price_crafts', { ascending: true });
                break;
            case 'price_desc':
                query = query.order('price_crafts', { ascending: false });
                break;
            case 'oldest':
                query = query.order('listed_at', { ascending: true });
                break;
            case 'newest':
            default:
                query = query.order('listed_at', { ascending: false });
        }

        // Pagination
        const from = (page - 1) * limit;
        query = query.range(from, from + limit - 1);

        const { data: listings, error, count } = await query;

        if (error) {
            logger.error('Marketplace query failed', { component: 'marketplace', error: error.message });
            return res.status(500).json({ error: 'Failed to fetch marketplace listings' });
        }

        return res.json({
            success: true,
            data: listings || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        logger.error('Marketplace browse error', { component: 'marketplace', error: error.message });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── GET /api/v1/marketplace/pricing — Fee and royalty model info ──────────────
/**
 * @swagger
 * /api/v1/marketplace/pricing:
 *   get:
 *     tags:
 *       - Marketplace
 *     summary: Get marketplace pricing model
 *     description: Returns platform fee percentage, royalty model info, and base prices in CRAFTS.
 *     responses:
 *       200:
 *         description: Pricing info.
 */
router.get('/pricing', async (req, res) => {
    try {
        const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '2.5');

        let onChainFee = null;
        try {
            if (process.env.CRAFTS_MARKETPLACE_ADDRESS && process.env.ALCHEMY_ETH_MAINNET_HTTP_URL) {
                const contract = getMarketplaceContract(false);
                const feeBps = await contract.platformFeeBps();
                onChainFee = Number(feeBps) / 100;
            }
        } catch {
            // On-chain read failed — use env fallback
        }

        return res.json({
            success: true,
            data: {
                currency: 'CRAFTS',
                currencyName: 'ComicCraft Tokens',
                platformFeePercent: onChainFee ?? platformFeePercent,
                royaltyModel: {
                    description: 'Creator-set royalty on each resale (0-50%)',
                    defaultPercent: 5,
                    maxPercent: 50,
                },
                mintPrice: {
                    description: 'Cost to mint a story NFT (native ETH)',
                    value: '0.001',
                    unit: 'ETH',
                },
            },
        });
    } catch (error) {
        logger.error('Pricing fetch error', { component: 'marketplace', error: error.message });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── POST /api/v1/marketplace/list — List an NFT for sale ─────────────────────
/**
 * @swagger
 * /api/v1/marketplace/list:
 *   post:
 *     tags:
 *       - Marketplace
 *     summary: List an NFT for sale in CRAFTS
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nftId
 *               - price
 *             properties:
 *               nftId:
 *                 type: string
 *                 description: Database NFT ID
 *               price:
 *                 type: string
 *                 description: Asking price in CRAFTS
 *               onChainTokenId:
 *                 type: string
 *                 description: On-chain token ID (if known)
 *     responses:
 *       200:
 *         description: NFT listed.
 *       400:
 *         description: Invalid input.
 *       403:
 *         description: Not the owner.
 *       500:
 *         description: Listing failed.
 */
router.post('/list', authRequired, async (req, res) => {
    try {
        const { nftId, price, onChainTokenId } = req.body;

        if (!nftId || !price) {
            return res.status(400).json({ error: 'nftId and price are required' });
        }

        const priceNum = Number(price);
        if (!Number.isFinite(priceNum) || priceNum <= 0) {
            return res.status(400).json({ error: 'Price must be a positive number' });
        }

        // Create listing record in database
        const { data: listing, error } = await supabaseAdmin
            .from('marketplace_listings')
            .insert({
                nft_id: nftId,
                seller_id: req.user.id,
                price_crafts: priceNum,
                on_chain_token_id: onChainTokenId || null,
                status: 'active',
                listed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            logger.error('Failed to create listing', {
                component: 'marketplace',
                nftId,
                error: error.message,
            });
            return res.status(500).json({ error: 'Failed to create listing' });
        }

        logger.info('NFT listed for sale', {
            component: 'marketplace',
            listingId: listing.id,
            nftId,
            price: priceNum,
            seller: req.user.id,
        });

        return res.json({
            success: true,
            message: 'NFT listed for sale',
            data: listing,
        });
    } catch (error) {
        logger.error('List error', { component: 'marketplace', error: error.message });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── POST /api/v1/marketplace/buy — Buy a listed NFT ─────────────────────────
/**
 * @swagger
 * /api/v1/marketplace/buy:
 *   post:
 *     tags:
 *       - Marketplace
 *     summary: Buy a listed NFT using CRAFTS
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *             properties:
 *               listingId:
 *                 type: string
 *                 description: Marketplace listing ID
 *     responses:
 *       200:
 *         description: Purchase successful.
 *       400:
 *         description: Invalid input or cannot buy own listing.
 *       404:
 *         description: Listing not found.
 *       500:
 *         description: Purchase failed.
 */
router.post('/buy', authRequired, async (req, res) => {
    try {
        const { listingId } = req.body;

        if (!listingId) {
            return res.status(400).json({ error: 'listingId is required' });
        }

        // Fetch the active listing
        const { data: listing, error: fetchError } = await supabaseAdmin
            .from('marketplace_listings')
            .select('*')
            .eq('id', listingId)
            .eq('status', 'active')
            .single();

        if (fetchError || !listing) {
            return res.status(404).json({ error: 'Active listing not found' });
        }

        // Cannot buy own listing
        if (listing.seller_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot purchase your own listing' });
        }

        // Mark as sold in database
        const { error: updateError } = await supabaseAdmin
            .from('marketplace_listings')
            .update({
                status: 'sold',
                buyer_id: req.user.id,
                sold_at: new Date().toISOString(),
            })
            .eq('id', listingId)
            .eq('status', 'active'); // Prevent double-purchase

        if (updateError) {
            logger.error('Failed to update listing', {
                component: 'marketplace',
                listingId,
                error: updateError.message,
            });
            return res.status(500).json({ error: 'Purchase failed — please retry' });
        }

        logger.info('NFT purchased', {
            component: 'marketplace',
            listingId,
            buyer: req.user.id,
            seller: listing.seller_id,
            price: listing.price_crafts,
        });

        return res.json({
            success: true,
            message: 'NFT purchased successfully',
            data: {
                listingId,
                nftId: listing.nft_id,
                price: listing.price_crafts,
                seller: listing.seller_id,
                buyer: req.user.id,
            },
        });
    } catch (error) {
        logger.error('Buy error', { component: 'marketplace', error: error.message });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── POST /api/v1/marketplace/cancel — Cancel a listing ───────────────────────
/**
 * @swagger
 * /api/v1/marketplace/cancel:
 *   post:
 *     tags:
 *       - Marketplace
 *     summary: Cancel an active listing
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *             properties:
 *               listingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Listing canceled.
 *       403:
 *         description: Not the seller.
 *       404:
 *         description: Listing not found.
 *       500:
 *         description: Cancel failed.
 */
router.post('/cancel', authRequired, async (req, res) => {
    try {
        const { listingId } = req.body;

        if (!listingId) {
            return res.status(400).json({ error: 'listingId is required' });
        }

        // Fetch listing
        const { data: listing, error: fetchError } = await supabaseAdmin
            .from('marketplace_listings')
            .select('*')
            .eq('id', listingId)
            .eq('status', 'active')
            .single();

        if (fetchError || !listing) {
            return res.status(404).json({ error: 'Active listing not found' });
        }

        // Only seller can cancel
        if (listing.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the seller can cancel this listing' });
        }

        const { error: updateError } = await supabaseAdmin
            .from('marketplace_listings')
            .update({
                status: 'canceled',
                canceled_at: new Date().toISOString(),
            })
            .eq('id', listingId);

        if (updateError) {
            logger.error('Failed to cancel listing', {
                component: 'marketplace',
                listingId,
                error: updateError.message,
            });
            return res.status(500).json({ error: 'Failed to cancel listing' });
        }

        logger.info('Listing canceled', {
            component: 'marketplace',
            listingId,
            seller: req.user.id,
        });

        return res.json({
            success: true,
            message: 'Listing canceled',
            data: { listingId },
        });
    } catch (error) {
        logger.error('Cancel error', { component: 'marketplace', error: error.message });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── GET /api/v1/marketplace/history/:userId — Transaction history ────────────
/**
 * @swagger
 * /api/v1/marketplace/history/{userId}:
 *   get:
 *     tags:
 *       - Marketplace
 *     summary: Get marketplace transaction history for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Transaction history.
 *       500:
 *         description: Internal server error.
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const from = (page - 1) * limit;

        const { data, error, count } = await supabaseAdmin
            .from('marketplace_listings')
            .select('*', { count: 'exact' })
            .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
            .in('status', ['sold', 'canceled'])
            .order('updated_at', { ascending: false })
            .range(from, from + limit - 1);

        if (error) {
            logger.error('History query failed', { component: 'marketplace', error: error.message });
            return res.status(500).json({ error: 'Failed to fetch history' });
        }

        return res.json({
            success: true,
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        logger.error('History error', { component: 'marketplace', error: error.message });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
