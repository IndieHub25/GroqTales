/**
 * Tests for tokenService.js
 * Tests CRAFTS balance reads, transfers, and approval management.
 */

const { describe, it, expect, jest, beforeEach, afterEach } = require('@jest/globals');

// Mock web3Service
jest.mock('../../server/services/web3Service', () => ({
    getProvider: jest.fn(() => ({})),
    getSigner: jest.fn(() => ({})),
    mapWeb3Error: jest.fn((err) => ({
        message: err.message,
        code: 'WEB3_ERROR',
        original: err,
    })),
}));

// Mock ethers
jest.mock('ethers', () => {
    const mockTransfer = jest.fn().mockResolvedValue({
        hash: '0xtxhash123',
        wait: jest.fn().mockResolvedValue({ status: 1, blockNumber: 100 }),
    });

    const mockApprove = jest.fn().mockResolvedValue({
        hash: '0xapprovehash',
        wait: jest.fn().mockResolvedValue({ status: 1 }),
    });

    const mockContract = {
        balanceOf: jest.fn().mockResolvedValue(500000000000000000000n),
        decimals: jest.fn().mockResolvedValue(18n),
        symbol: jest.fn().mockResolvedValue('CRAFTS'),
        name: jest.fn().mockResolvedValue('ComicCraft Tokens'),
        totalSupply: jest.fn().mockResolvedValue(1000000000000000000000000n),
        transfer: mockTransfer,
        approve: mockApprove,
    };

    return {
        Contract: jest.fn(() => mockContract),
        isAddress: jest.fn((addr) => /^0x[a-fA-F0-9]{40}$/.test(addr)),
        formatUnits: jest.fn((val, decimals) => '500.0'),
        formatEther: jest.fn((val) => '1.0'),
        parseUnits: jest.fn((val, decimals) => 100000000000000000000n),
    };
});

describe('tokenService', () => {
    let tokenService;
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.resetModules();
        process.env.CRAFTS_TOKEN_ADDRESS = '0xCRAFTS0000000000000000000000000000000001';
        process.env.MONAD_RPC_URL = 'https://rpc.test';
        process.env.PLATFORM_SIGNER_KEY = '0x' + 'a'.repeat(64);
        tokenService = require('../../server/services/tokenService');
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe('getBalance', () => {
        it('should return formatted CRAFTS balance', async () => {
            const result = await tokenService.getBalance('0x1234567890abcdef1234567890abcdef12345678');
            expect(result).toHaveProperty('balance');
            expect(result).toHaveProperty('balanceRaw');
            expect(result.balance).toBe('500.0');
        });

        it('should throw for invalid address', async () => {
            await expect(tokenService.getBalance('invalid')).rejects.toThrow('Invalid wallet address');
        });
    });

    describe('getNativeBalance', () => {
        it('should return native MON balance', async () => {
            const balance = await tokenService.getNativeBalance('0x1234567890abcdef1234567890abcdef12345678');
            expect(balance).toBe('1.0');
        });

        it('should throw for invalid address', async () => {
            await expect(tokenService.getNativeBalance('bad-addr')).rejects.toThrow('Invalid wallet address');
        });
    });

    describe('transferCrafts', () => {
        it('should execute transfer and return txHash', async () => {
            const result = await tokenService.transferCrafts(
                '0x1234567890abcdef1234567890abcdef12345678',
                '100'
            );
            expect(result).toHaveProperty('txHash');
            expect(result).toHaveProperty('amount', '100');
        });

        it('should throw for invalid recipient address', async () => {
            await expect(tokenService.transferCrafts('bad', '100')).rejects.toThrow('Invalid recipient');
        });
    });

    describe('approveCrafts', () => {
        it('should approve spending and return txHash', async () => {
            const result = await tokenService.approveCrafts(
                '0x1234567890abcdef1234567890abcdef12345678',
                '1000'
            );
            expect(result).toHaveProperty('txHash');
        });

        it('should throw for invalid spender address', async () => {
            await expect(tokenService.approveCrafts('bad', '100')).rejects.toThrow('Invalid spender');
        });
    });

    describe('getTokenInfo', () => {
        it('should return CRAFTS token metadata', async () => {
            const info = await tokenService.getTokenInfo();
            expect(info.name).toBe('ComicCraft Tokens');
            expect(info.symbol).toBe('CRAFTS');
            expect(info.decimals).toBe(18);
            expect(info).toHaveProperty('totalSupply');
        });
    });

    describe('getCraftsContract', () => {
        it('should throw when CRAFTS_TOKEN_ADDRESS is not set', () => {
            delete process.env.CRAFTS_TOKEN_ADDRESS;
            jest.resetModules();
            const freshService = require('../../server/services/tokenService');
            expect(() => freshService.getCraftsContract()).toThrow('CRAFTS_TOKEN_ADDRESS');
        });
    });
});
