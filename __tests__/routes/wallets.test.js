/**
 * Tests for /api/v1/wallets routes
 * Tests wallet creation, balance queries, and transfers.
 */

const { describe, it, expect, jest, beforeEach, afterEach } = require('@jest/globals');

// Mock dependencies
jest.mock('../../server/middleware/auth', () => ({
    authRequired: (req, res, next) => {
        req.user = { id: 'test-user-id-123' };
        next();
    },
}));

jest.mock('../../server/config/supabase', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: null,
                error: null,
            }),
            upsert: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
        })),
    },
}));

jest.mock('../../server/services/tokenService', () => ({
    getBalance: jest.fn().mockResolvedValue({ balance: '500.0', balanceRaw: '500000000000000000000' }),
    getNativeBalance: jest.fn().mockResolvedValue('1.5'),
    transferCrafts: jest.fn().mockResolvedValue({ txHash: '0xabc123', amount: '100' }),
    getTokenInfo: jest.fn().mockResolvedValue({
        name: 'ComicCraft Tokens',
        symbol: 'CRAFTS',
        decimals: 18,
        totalSupply: '1000000.0',
    }),
}));

jest.mock('ethers', () => ({
    Wallet: { createRandom: jest.fn(() => ({ address: '0xNEWWALLET1234567890abcdef12345678' })) },
    isAddress: jest.fn((addr) => /^0x[a-fA-F0-9]{40}$/.test(addr)),
}));

const express = require('express');
const request = require('supertest');

describe('Wallet Routes — /api/v1/wallets', () => {
    let app;
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.resetModules();
        process.env.MONAD_RPC_URL = 'https://rpc.test';
        process.env.CRAFTS_TOKEN_ADDRESS = '0xCRAFTS0000000000000000000000000000000001';

        app = express();
        app.use(express.json());
        app.use('/api/v1/wallets', require('../../server/routes/wallets'));
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe('POST /api/v1/wallets', () => {
        it('should return 201 when creating a new wallet', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
                upsert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { wallet_address: '0xnewwallet1234567890abcdef12345678', wallet_type: 'managed' },
                        error: null,
                    }),
                }),
            });

            const res = await request(app)
                .post('/api/v1/wallets')
                .send({});

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Wallet created');
        });

        it('should return 200 when wallet already exists', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { wallet_address: '0xexisting', wallet_type: 'managed' },
                    error: null,
                }),
            });

            const res = await request(app)
                .post('/api/v1/wallets')
                .send({});

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Wallet already exists');
        });
    });

    describe('GET /api/v1/wallets/me', () => {
        it('should return wallet state with balances', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: {
                        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
                        wallet_type: 'managed',
                        wallet_verified: true,
                    },
                    error: null,
                }),
            });

            const res = await request(app)
                .get('/api/v1/wallets/me');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.hasWallet).toBe(true);
            expect(res.body.data.walletAddress).toBeTruthy();
        });

        it('should return hasWallet=false when no wallet', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            const res = await request(app)
                .get('/api/v1/wallets/me');

            expect(res.status).toBe(200);
            expect(res.body.data.hasWallet).toBe(false);
        });
    });

    describe('POST /api/v1/wallets/transfer', () => {
        it('should reject invalid recipient address', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/transfer')
                .send({ to: 'invalid', amount: '100' });

            expect(res.status).toBe(400);
        });

        it('should reject non-positive amount', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/transfer')
                .send({ to: '0x1234567890abcdef1234567890abcdef12345678', amount: '-5' });

            expect(res.status).toBe(400);
        });

        it('should reject amounts over 10,000', async () => {
            const res = await request(app)
                .post('/api/v1/wallets/transfer')
                .send({ to: '0x1234567890abcdef1234567890abcdef12345678', amount: '50000' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('10,000');
        });
    });

    describe('GET /api/v1/wallets/:userId/balance', () => {
        it('should return 404 when user has no wallet', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            const res = await request(app)
                .get('/api/v1/wallets/nonexistent-user/balance');

            expect(res.status).toBe(404);
        });
    });
});
