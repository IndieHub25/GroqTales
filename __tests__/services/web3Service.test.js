/**
 * Tests for web3Service.js
 * Tests provider/signer initialization, health checks, and error mapping.
 */

const { describe, it, expect, jest, beforeEach, afterEach } = require('@jest/globals');

// Mock ethers before importing the service
jest.mock('ethers', () => {
    const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({ chainId: 10143n }),
        getBlockNumber: jest.fn().mockResolvedValue(12345),
        getBalance: jest.fn().mockResolvedValue(1000000000000000000n),
        estimateGas: jest.fn().mockResolvedValue(21000n),
    };

    const mockWallet = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        estimateGas: jest.fn().mockResolvedValue(21000n),
        sendTransaction: jest.fn().mockResolvedValue({
            hash: '0xabc123',
            to: '0xrecipient',
            wait: jest.fn().mockResolvedValue({
                status: 1,
                blockNumber: 12346,
                gasUsed: 21000n,
            }),
        }),
    };

    return {
        JsonRpcProvider: jest.fn(() => mockProvider),
        Wallet: jest.fn(() => mockWallet),
        isAddress: jest.fn((addr) => /^0x[a-fA-F0-9]{40}$/.test(addr)),
        formatEther: jest.fn((val) => '1.0'),
    };
});

describe('web3Service', () => {
    let web3Service;
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.resetModules();
        process.env.MONAD_RPC_URL = 'https://monad-testnet.g.alchemy.com/v2/test-key';
        process.env.MONAD_CHAIN_ID = '10143';
        process.env.PLATFORM_SIGNER_KEY = '0x' + 'a'.repeat(64);
        web3Service = require('../../server/services/web3Service');
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        if (web3Service?.resetConnections) {
            web3Service.resetConnections();
        }
    });

    describe('getProvider', () => {
        it('should return a provider when MONAD_RPC_URL is set', () => {
            const provider = web3Service.getProvider();
            expect(provider).toBeDefined();
        });

        it('should throw when MONAD_RPC_URL is not set', () => {
            delete process.env.MONAD_RPC_URL;
            web3Service.resetConnections();
            jest.resetModules();
            const freshService = require('../../server/services/web3Service');
            expect(() => freshService.getProvider()).toThrow('MONAD_RPC_URL');
        });

        it('should return the same provider on subsequent calls (singleton)', () => {
            const p1 = web3Service.getProvider();
            const p2 = web3Service.getProvider();
            expect(p1).toBe(p2);
        });
    });

    describe('getSigner', () => {
        it('should return a signer when PLATFORM_SIGNER_KEY is set', () => {
            const signer = web3Service.getSigner();
            expect(signer).toBeDefined();
        });

        it('should throw when PLATFORM_SIGNER_KEY is not set', () => {
            delete process.env.PLATFORM_SIGNER_KEY;
            web3Service.resetConnections();
            jest.resetModules();
            const freshService = require('../../server/services/web3Service');
            expect(() => freshService.getSigner()).toThrow('PLATFORM_SIGNER_KEY');
        });
    });

    describe('getChainId', () => {
        it('should return the chain ID as a number', async () => {
            const chainId = await web3Service.getChainId();
            expect(chainId).toBe(10143);
        });
    });

    describe('getBlockNumber', () => {
        it('should return the latest block number', async () => {
            const blockNumber = await web3Service.getBlockNumber();
            expect(blockNumber).toBe(12345);
        });
    });

    describe('getNativeBalance', () => {
        it('should return formatted balance for a valid address', async () => {
            const balance = await web3Service.getNativeBalance('0x1234567890abcdef1234567890abcdef12345678');
            expect(balance).toBe('1.0');
        });

        it('should throw for an invalid address', async () => {
            await expect(web3Service.getNativeBalance('invalid')).rejects.toThrow('Invalid address');
        });
    });

    describe('mapWeb3Error', () => {
        it('should map insufficient funds error', () => {
            const result = web3Service.mapWeb3Error(new Error('insufficient funds for gas'));
            expect(result.code).toBe('INSUFFICIENT_FUNDS');
        });

        it('should map nonce error', () => {
            const result = web3Service.mapWeb3Error(new Error('nonce too low'));
            expect(result.code).toBe('NONCE_CONFLICT');
        });

        it('should map execution reverted error', () => {
            const result = web3Service.mapWeb3Error(new Error('execution reverted: reason'));
            expect(result.code).toBe('EXECUTION_REVERTED');
        });

        it('should map timeout error', () => {
            const result = web3Service.mapWeb3Error(new Error('request timeout'));
            expect(result.code).toBe('RPC_TIMEOUT');
        });

        it('should return generic WEB3_ERROR for unknown errors', () => {
            const result = web3Service.mapWeb3Error(new Error('something unexpected'));
            expect(result.code).toBe('WEB3_ERROR');
        });
    });

    describe('checkWeb3Health', () => {
        it('should return healthy status when configured and connected', async () => {
            const health = await web3Service.checkWeb3Health();
            expect(health.configured).toBe(true);
            expect(health.connected).toBe(true);
            expect(health.chainId).toBe(10143);
            expect(health.blockNumber).toBe(12345);
        });

        it('should return not-configured when MONAD_RPC_URL is missing', async () => {
            delete process.env.MONAD_RPC_URL;
            web3Service.resetConnections();
            jest.resetModules();
            const freshService = require('../../server/services/web3Service');
            const health = await freshService.checkWeb3Health();
            expect(health.configured).toBe(false);
            expect(health.connected).toBe(false);
        });
    });
});
