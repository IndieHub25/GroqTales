/**
 * Web3 Service — Core blockchain provider and transaction helpers
 *
 * Provides a reusable abstraction over ethers.js for Ethereum mainnet via Alchemy RPC.
 * All secrets come from environment variables — never hardcoded.
 */

const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Validate ETHEREUM_CHAIN_ID at startup
const parsedChainId = parseInt(process.env.ETHEREUM_CHAIN_ID || '1', 10);
if (!Number.isFinite(parsedChainId) || Number.isNaN(parsedChainId) || parsedChainId <= 0) {
    throw new Error('Invalid ETHEREUM_CHAIN_ID environment variable: must be a positive integer');
}
const VALIDATED_CHAIN_ID = parsedChainId;

// ── Lazy singletons ──────────────────────────────────────────────────────────
let _provider = null;
let _signer = null;

/**
 * Get a JSON-RPC provider connected to Ethereum mainnet.
 * @returns {import('ethers').JsonRpcProvider}
 */
function getProvider() {
    if (_provider) return _provider;

    const rpcUrl = process.env.ALCHEMY_ETH_MAINNET_HTTP_URL;
    if (!rpcUrl) {
        throw new Error('ALCHEMY_ETH_MAINNET_HTTP_URL environment variable is not set');
    }

    _provider = new ethers.JsonRpcProvider(rpcUrl, {
        name: 'eth-mainnet',
        chainId: VALIDATED_CHAIN_ID,
    });

    return _provider;
}

/**
 * Get a Wallet signer backed by the platform's private key.
 * Used for server-initiated transactions (minting, marketplace settlement).
 * NEVER expose this key to clients.
 * @returns {import('ethers').Wallet}
 */
function getSigner() {
    if (_signer) return _signer;

    const privateKey = process.env.PLATFORM_SIGNER_KEY;
    if (!privateKey) {
        throw new Error('PLATFORM_SIGNER_KEY environment variable is not set');
    }

    _signer = new ethers.Wallet(privateKey, getProvider());
    return _signer;
}

/**
 * Reset cached provider/signer (useful for tests).
 */
function resetConnections() {
    _provider = null;
    _signer = null;
}

// ── On-chain reads ───────────────────────────────────────────────────────────

/**
 * Get the connected chain ID to verify we're on the right network.
 * @returns {Promise<number>}
 */
async function getChainId() {
    const network = await getProvider().getNetwork();
    return Number(network.chainId);
}

/**
 * Get the latest block number.
 * @returns {Promise<number>}
 */
async function getBlockNumber() {
    return getProvider().getBlockNumber();
}

/**
 * Get native token (ETH) balance for a wallet address.
 * @param {string} address
 * @returns {Promise<string>} Balance in ether units
 */
async function getNativeBalance(address) {
    if (!ethers.isAddress(address)) {
        throw new Error(`Invalid address: ${address}`);
    }
    const balWei = await getProvider().getBalance(address);
    return ethers.formatEther(balWei);
}

// ── Transaction helpers ──────────────────────────────────────────────────────

/**
 * Send a transaction with the platform signer.
 * Handles gas estimation and clear error mapping.
 * @param {import('ethers').TransactionRequest} txRequest
 * @returns {Promise<import('ethers').TransactionReceipt>}
 */
async function sendTransaction(txRequest) {
    const signer = getSigner();

    try {
        // Estimate gas with a 20% buffer
        const gasEstimate = await signer.estimateGas(txRequest);
        txRequest.gasLimit = (gasEstimate * 120n) / 100n;

        const tx = await signer.sendTransaction(txRequest);
        logger.info('Transaction sent', {
            component: 'web3',
            hash: tx.hash,
            to: tx.to,
        });

        const receipt = await tx.wait();

        if (receipt.status === 0) {
            throw new Error(`Transaction reverted: ${tx.hash}`);
        }

        logger.info('Transaction confirmed', {
            component: 'web3',
            hash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        });

        return receipt;
    } catch (error) {
        // Map ethers errors to readable messages
        const mapped = mapWeb3Error(error);
        logger.error('Transaction failed', {
            component: 'web3',
            error: mapped.message,
            code: mapped.code,
        });
        throw mapped;
    }
}

/**
 * Map ethers.js / RPC errors to consistent error objects.
 * @param {Error} error
 * @returns {{ message: string, code: string, original: Error }}
 */
function mapWeb3Error(error) {
    const msg = error.message || '';

    if (msg.includes('insufficient funds')) {
        return { message: 'Insufficient funds for transaction', code: 'INSUFFICIENT_FUNDS', original: error };
    }
    if (msg.includes('nonce')) {
        return { message: 'Transaction nonce conflict — please retry', code: 'NONCE_CONFLICT', original: error };
    }
    if (msg.includes('execution reverted')) {
        // Try to extract revert reason
        const reason = error.reason || error.data || 'Unknown revert reason';
        return { message: `Contract execution reverted: ${reason}`, code: 'EXECUTION_REVERTED', original: error };
    }
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
        return { message: 'RPC connection timed out', code: 'RPC_TIMEOUT', original: error };
    }
    if (msg.includes('could not detect network') || msg.includes('ECONNREFUSED')) {
        return { message: 'Cannot connect to Ethereum RPC', code: 'RPC_UNREACHABLE', original: error };
    }

    return { message: `Web3 error: ${msg}`, code: 'WEB3_ERROR', original: error };
}

/**
 * Check Web3 connectivity — returns structured health info.
 * @returns {Promise<object>}
 */
async function checkWeb3Health() {
    const result = {
        configured: !!process.env.ALCHEMY_ETH_MAINNET_HTTP_URL,
        connected: false,
        chainId: null,
        blockNumber: null,
        signerAddress: null,
        error: null,
    };

    if (!result.configured) {
        result.error = 'ALCHEMY_ETH_MAINNET_HTTP_URL not configured';
        return result;
    }

    try {
        result.chainId = await getChainId();
        result.blockNumber = await getBlockNumber();
        result.connected = true;

        if (process.env.PLATFORM_SIGNER_KEY) {
            result.signerAddress = getSigner().address;
        }
    } catch (error) {
        result.error = error.message;
    }

    return result;
}

module.exports = {
    getProvider,
    getSigner,
    resetConnections,
    getChainId,
    getBlockNumber,
    getNativeBalance,
    sendTransaction,
    mapWeb3Error,
    checkWeb3Health,
};
