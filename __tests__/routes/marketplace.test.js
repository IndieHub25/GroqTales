/**
 * Tests for /api/v1/marketplace routes
 * Tests browse, list, buy, cancel, and history endpoints.
 */

const { describe, it, expect, jest, beforeEach, afterEach } = require('@jest/globals');

// Mock dependencies
jest.mock('../../server/middleware/auth', () => ({
    authRequired: (req, res, next) => {
        req.user = { id: 'buyer-user-id' };
        next();
    },
}));

const mockListings = [
    {
        id: 'listing-1',
        nft_id: 'nft-1',
        seller_id: 'seller-user-id',
        price_crafts: 100,
        status: 'active',
        listed_at: '2026-03-07T10:00:00Z',
    },
    {
        id: 'listing-2',
        nft_id: 'nft-2',
        seller_id: 'seller-user-id-2',
        price_crafts: 250,
        status: 'active',
        listed_at: '2026-03-07T11:00:00Z',
    },
];

jest.mock('../../server/config/supabase', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            ilike: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0,
            }),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
        })),
    },
}));

jest.mock('../../server/services/web3Service', () => ({
    getProvider: jest.fn(() => ({})),
    getSigner: jest.fn(() => ({})),
    mapWeb3Error: jest.fn((err) => err),
}));

jest.mock('../../server/services/tokenService', () => ({
    getBalance: jest.fn(),
}));

jest.mock('../../server/services/nftContractService', () => ({
    getTokenOwner: jest.fn(),
    approveForMarketplace: jest.fn(),
}));

jest.mock('ethers', () => ({
    Contract: jest.fn(),
    isAddress: jest.fn(() => true),
}));

const express = require('express');
const request = require('supertest');

describe('Marketplace Routes — /api/v1/marketplace', () => {
    let app;

    beforeEach(() => {
        jest.resetModules();
        process.env.MONAD_RPC_URL = 'https://rpc.test';
        process.env.CRAFTS_MARKETPLACE_ADDRESS = '0xMARKETPLACE000000000000000000000000000001';

        app = express();
        app.use(express.json());
        app.use('/api/v1/marketplace', require('../../server/routes/marketplace'));
    });

    describe('GET /api/v1/marketplace', () => {
        it('should return paginated listings', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockResolvedValue({
                    data: mockListings,
                    error: null,
                    count: 2,
                }),
            });

            const res = await request(app)
                .get('/api/v1/marketplace?page=1&limit=10');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.pagination.total).toBe(2);
        });

        it('should accept filter parameters', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                gte: jest.fn().mockReturnThis(),
                lte: jest.fn().mockReturnThis(),
                ilike: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                    count: 0,
                }),
            });

            const res = await request(app)
                .get('/api/v1/marketplace?minPrice=50&maxPrice=200&genre=fantasy&sort=price_asc');

            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/v1/marketplace/pricing', () => {
        it('should return pricing model', async () => {
            const res = await request(app)
                .get('/api/v1/marketplace/pricing');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.currency).toBe('CRAFTS');
            expect(res.body.data.platformFeePercent).toBeDefined();
            expect(res.body.data.royaltyModel).toBeDefined();
        });
    });

    describe('POST /api/v1/marketplace/list', () => {
        it('should require nftId and price', async () => {
            const res = await request(app)
                .post('/api/v1/marketplace/list')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should reject non-positive price', async () => {
            const res = await request(app)
                .post('/api/v1/marketplace/list')
                .send({ nftId: 'nft-1', price: '-10' });

            expect(res.status).toBe(400);
        });

        it('should create listing with valid input', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'new-listing', nft_id: 'nft-1', price_crafts: 100, status: 'active' },
                            error: null,
                        }),
                    }),
                }),
            });

            const res = await request(app)
                .post('/api/v1/marketplace/list')
                .send({ nftId: 'nft-1', price: '100' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /api/v1/marketplace/buy', () => {
        it('should require listingId', async () => {
            const res = await request(app)
                .post('/api/v1/marketplace/buy')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should return 404 for non-existent listing', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            const res = await request(app)
                .post('/api/v1/marketplace/buy')
                .send({ listingId: 'nonexistent' });

            expect(res.status).toBe(404);
        });

        it('should prevent buying own listing', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { id: 'listing-1', seller_id: 'buyer-user-id', price_crafts: 100, status: 'active' },
                    error: null,
                }),
            });

            const res = await request(app)
                .post('/api/v1/marketplace/buy')
                .send({ listingId: 'listing-1' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('own listing');
        });
    });

    describe('POST /api/v1/marketplace/cancel', () => {
        it('should require listingId', async () => {
            const res = await request(app)
                .post('/api/v1/marketplace/cancel')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should return 403 when non-seller tries to cancel', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { id: 'listing-1', seller_id: 'other-user', status: 'active' },
                    error: null,
                }),
            });

            const res = await request(app)
                .post('/api/v1/marketplace/cancel')
                .send({ listingId: 'listing-1' });

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/v1/marketplace/history/:userId', () => {
        it('should return paginated transaction history', async () => {
            const { supabaseAdmin } = require('../../server/config/supabase');
            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                    count: 0,
                }),
            });

            const res = await request(app)
                .get('/api/v1/marketplace/history/test-user?page=1&limit=10');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });
    });
});
