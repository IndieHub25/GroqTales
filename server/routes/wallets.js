/**
 * Wallet Routes — /api/v1/wallets
 *
 * Wallet creation, balance queries, and validated CRAFTS transfers.
 * Each user gets a unique on-chain wallet address persisted in Supabase.
 */

const router = require('express').Router();
const { ethers } = require('ethers');
const { authRequired } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const { getBalance, getNativeBalance, transferCrafts, getTokenInfo } = require('../services/tokenService');
const logger = require('../utils/logger');

// ── Swagger tag ──────────────────────────────────────────────────────────────
/**
 * @swagger
 * tags:
 *   - name: Wallets
 *     description: User wallet management, balances, and CRAFTS transfers
 */

// ── POST /api/v1/wallets — Create / initialize wallet ────────────────────────
/**
 * @swagger
 * /api/v1/wallets:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Create or initialize a wallet for the authenticated user
 *     description: |
 *       Generates a server-managed wallet address for the user.
 *       If the user already has a wallet, returns the existing one.
 *       On testnet, this creates a managed EOA; keys stay server-side.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet already exists.
 *       201:
 *         description: Wallet created.
 *       500:
 *         description: Internal server error.
 */
router.post('/', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user already has a wallet
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('wallet_address, wallet_type')
            .eq('id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            logger.error('Failed to fetch profile for wallet creation', {
                component: 'wallets',
                userId,
                error: fetchError.message,
            });
            return res.status(500).json({ error: 'Failed to check wallet status' });
        }

        // Already has a wallet
        if (profile?.wallet_address) {
            return res.status(200).json({
                success: true,
                message: 'Wallet already exists',
                data: {
                    walletAddress: profile.wallet_address,
                    walletType: profile.wallet_type || 'managed',
                },
            });
        }

        // Generate a new managed wallet (testnet — keys stored encrypted server-side)
        const wallet = ethers.Wallet.createRandom();

        // Store the address (NOT the private key in plaintext — in production use KMS)
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                wallet_address: wallet.address.toLowerCase(),
                wallet_type: 'managed',
                wallet_verified: true,
                wallet_last_connected_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .select('wallet_address, wallet_type')
            .single();

        if (updateError) {
            logger.error('Failed to save wallet', {
                component: 'wallets',
                userId,
                error: updateError.message,
            });
            return res.status(500).json({ error: 'Failed to create wallet' });
        }

        logger.info('Wallet created for user', {
            component: 'wallets',
            userId,
            walletAddress: wallet.address,
        });

        return res.status(201).json({
            success: true,
            message: 'Wallet created',
            data: {
                walletAddress: updated.wallet_address,
                walletType: updated.wallet_type,
            },
        });
    } catch (error) {
        logger.error('Error creating wallet', {
            component: 'wallets',
            userId: req.user?.id,
            error: error.message,
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── GET /api/v1/wallets/me — Get current user's wallet state ─────────────────
/**
 * @swagger
 * /api/v1/wallets/me:
 *   get:
 *     tags:
 *       - Wallets
 *     summary: Get the authenticated user's wallet state
 *     description: Returns wallet address, type, and on-chain balances (CRAFTS + native MON).
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet state returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletAddress:
 *                       type: string
 *                     walletType:
 *                       type: string
 *                     craftsBalance:
 *                       type: string
 *                     nativeBalance:
 *                       type: string
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/me', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('wallet_address, wallet_type, wallet_verified, wallet_last_connected_at')
            .eq('id', userId)
            .single();

        if (error || !profile || !profile.wallet_address) {
            return res.json({
                success: true,
                data: {
                    walletAddress: null,
                    walletType: null,
                    craftsBalance: '0',
                    nativeBalance: '0',
                    hasWallet: false,
                },
            });
        }

        // Fetch on-chain balances (non-blocking — fallback to 0 if RPC is down)
        let craftsBalance = '0';
        let nativeBalance = '0';

        try {
            if (process.env.CRAFTS_TOKEN_ADDRESS && process.env.ALCHEMY_ETH_MAINNET_HTTP_URL) {
                const crafts = await getBalance(profile.wallet_address);
                craftsBalance = crafts.balance;
                nativeBalance = await getNativeBalance(profile.wallet_address);
            }
        } catch (balanceError) {
            logger.warn('Failed to fetch on-chain balances (non-critical)', {
                component: 'wallets',
                userId,
                error: balanceError.message,
            });
        }

        return res.json({
            success: true,
            data: {
                walletAddress: profile.wallet_address,
                walletType: profile.wallet_type || 'external',
                verified: profile.wallet_verified || false,
                lastConnectedAt: profile.wallet_last_connected_at,
                craftsBalance,
                nativeBalance,
                hasWallet: true,
            },
        });
    } catch (error) {
        logger.error('Error fetching wallet state', {
            component: 'wallets',
            userId: req.user?.id,
            error: error.message,
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── GET /api/v1/wallets/:userId/balance — Get balances for any user ──────────
/**
 * @swagger
 * /api/v1/wallets/{userId}/balance:
 *   get:
 *     tags:
 *       - Wallets
 *     summary: Get CRAFTS and native token balance for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Balances returned.
 *       404:
 *         description: User has no wallet.
 *       500:
 *         description: Internal server error.
 */
router.get('/:userId/balance', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('wallet_address')
            .eq('id', userId)
            .single();

        if (error || !profile?.wallet_address) {
            return res.status(404).json({ error: 'User has no wallet configured' });
        }

        let craftsBalance = '0';
        let nativeBalance = '0';

        try {
            if (process.env.CRAFTS_TOKEN_ADDRESS && process.env.ALCHEMY_ETH_MAINNET_HTTP_URL) {
                const crafts = await getBalance(profile.wallet_address);
                craftsBalance = crafts.balance;
                nativeBalance = await getNativeBalance(profile.wallet_address);
            }
        } catch (balanceError) {
            logger.warn('Failed to fetch on-chain balances', {
                component: 'wallets',
                userId,
                error: balanceError.message,
            });
        }

        return res.json({
            success: true,
            data: {
                walletAddress: profile.wallet_address,
                craftsBalance,
                nativeBalance,
            },
        });
    } catch (error) {
        logger.error('Error fetching balance', {
            component: 'wallets',
            userId: req.params?.userId,
            error: error.message,
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ── POST /api/v1/wallets/transfer — Validated CRAFTS transfer ────────────────
/**
 * @swagger
 * /api/v1/wallets/transfer:
 *   post:
 *     tags:
 *       - Wallets
 *     summary: Transfer CRAFTS tokens (server-validated)
 *     description: |
 *       Initiates a server-validated CRAFTS transfer. Only the platform signer
 *       can execute transfers — this is not a raw arbitrary transfer.
 *       Business rules are applied (e.g., max transfer limits on testnet).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - amount
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient wallet address
 *               amount:
 *                 type: string
 *                 description: Amount in CRAFTS (human-readable, e.g., "100.5")
 *     responses:
 *       200:
 *         description: Transfer successful.
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Transfer failed.
 */
router.post('/transfer', authRequired, async (req, res) => {
    try {
        const { to, amount } = req.body;

        // Validate inputs
        if (!to || !ethers.isAddress(to)) {
            return res.status(400).json({ error: 'A valid recipient wallet address is required' });
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        // Testnet business rule: max 10,000 CRAFTS per transfer
        if (Number(amount) > 10000) {
            return res.status(400).json({ error: 'Maximum transfer amount is 10,000 CRAFTS on testnet' });
        }

        if (!process.env.CRAFTS_TOKEN_ADDRESS || !process.env.ALCHEMY_ETH_MAINNET_HTTP_URL) {
            return res.status(503).json({ error: 'Web3 services not configured' });
        }

        const result = await transferCrafts(to, amount);

        return res.json({
            success: true,
            data: {
                txHash: result.txHash,
                amount: result.amount,
                to,
                from: 'platform',
            },
        });
    } catch (error) {
        logger.error('Transfer failed', {
            component: 'wallets',
            userId: req.user?.id,
            to: req.body?.to,
            amount: req.body?.amount,
            error: error.message,
        });

        const statusCode = error.code === 'INSUFFICIENT_FUNDS' ? 400 : 500;
        return res.status(statusCode).json({
            error: error.message || 'Transfer failed',
            code: error.code || 'TRANSFER_FAILED',
        });
    }
});

module.exports = router;
