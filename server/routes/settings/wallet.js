/**
 * Wallet Settings Route — Supabase
 */

const router = require('express').Router();
const { authRequired: requireAuth } = require('../../middleware/auth');
const { supabaseAdmin } = require('../../config/supabase');

/**
 * @swagger
 * /api/v1/settings/wallet:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get wallet settings
 *     description: Returns the authenticated user's connected wallet address and status.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet settings retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     address:
 *                       type: string
 *                       example: "0x1234567890abcdef1234567890abcdef12345678"
 *                     connected:
 *                       type: boolean
 *                     verified:
 *                       type: boolean
 *                     lastConnectedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 *   put:
 *     tags:
 *       - Settings
 *     summary: Connect or update wallet
 *     description: Connects an Ethereum wallet address to the authenticated user's account.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 pattern: '^0x[a-fA-F0-9]{40}$'
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Wallet connected successfully.
 *       400:
 *         description: Invalid wallet address.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('wallet_address, wallet_verified, wallet_last_connected_at')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            return res.json({ success: true, data: null });
        }

        return res.json({
            success: true,
            data: {
                address: profile.wallet_address || '',
                connected: !!profile.wallet_address,
                verified: profile.wallet_verified || false,
                lastConnectedAt: profile.wallet_last_connected_at || null,
            },
        });
    } catch (err) {
        console.error('Fetch wallet failed:', err);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch wallet' } });
    }
});

router.put('/', requireAuth, async (req, res) => {
    try {
        const { address } = req.body;

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({
                success: false,
                error: { message: 'A valid wallet address is required' },
            });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                wallet_address: address.toLowerCase(),
                wallet_verified: false,
                wallet_last_connected_at: new Date().toISOString(),
            })
            .eq('id', req.user.id)
            .select('wallet_address, wallet_verified, wallet_last_connected_at')
            .single();

        if (error) {
            console.error('Wallet update error:', error);
            return res.status(500).json({ success: false, error: { message: 'Server error' } });
        }

        if (!data) {
            return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }

        return res.json({
            success: true,
            data: {
                address: data.wallet_address,
                connected: true,
                verified: data.wallet_verified,
                lastConnectedAt: data.wallet_last_connected_at,
            },
        });
    } catch (err) {
        console.error('Wallet update failed:', err);
        res.status(500).json({ success: false, error: { message: 'Server error' } });
    }
});

module.exports = router;