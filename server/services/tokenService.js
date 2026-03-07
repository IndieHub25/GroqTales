/**
 * Token Service — CRAFTS (ComicCraft Tokens) on-chain helpers
 *
 * Reads balances, performs server-initiated transfers, and manages allowances.
 * All contract calls go through the platform signer — keys stay server-side.
 */

const { ethers } = require('ethers');
const { getProvider, getSigner, mapWeb3Error } = require('./web3Service');
const logger = require('../utils/logger');

// Minimal ERC-20 ABI — only the functions we need
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
    'function totalSupply() view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * Get an ethers Contract instance for the CRAFTS token.
 * @param {boolean} [withSigner=false] If true, use the platform signer for write calls.
 * @returns {import('ethers').Contract}
 */
function getCraftsContract(withSigner = false) {
    const address = process.env.CRAFTS_TOKEN_ADDRESS;
    if (!address) {
        throw new Error('CRAFTS_TOKEN_ADDRESS environment variable is not set');
    }
    if (!ethers.isAddress(address)) {
        throw new Error(`Invalid CRAFTS_TOKEN_ADDRESS: ${address}`);
    }

    const providerOrSigner = withSigner ? getSigner() : getProvider();
    return new ethers.Contract(address, ERC20_ABI, providerOrSigner);
}

/**
 * Get the CRAFTS balance for a wallet address.
 * @param {string} walletAddress
 * @returns {Promise<{ balance: string, balanceRaw: string }>}
 */
async function getBalance(walletAddress) {
    if (!ethers.isAddress(walletAddress)) {
        throw new Error(`Invalid wallet address: ${walletAddress}`);
    }

    const contract = getCraftsContract(false);
    const rawBalance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();

    return {
        balance: ethers.formatUnits(rawBalance, decimals),
        balanceRaw: rawBalance.toString(),
    };
}

/**
 * Get the native MON token balance for a wallet.
 * @param {string} walletAddress
 * @returns {Promise<string>} Balance in ether units
 */
async function getNativeBalance(walletAddress) {
    if (!ethers.isAddress(walletAddress)) {
        throw new Error(`Invalid wallet address: ${walletAddress}`);
    }
    const bal = await getProvider().getBalance(walletAddress);
    return ethers.formatEther(bal);
}

/**
 * Transfer CRAFTS from the platform signer to a recipient.
 * Used for testnet faucet / reward distribution.
 * @param {string} to        Recipient address.
 * @param {string} amount    Amount in human-readable units (e.g., "100.5").
 * @returns {Promise<{ txHash: string, amount: string }>}
 */
async function transferCrafts(to, amount) {
    if (!ethers.isAddress(to)) {
        throw new Error(`Invalid recipient address: ${to}`);
    }

    const parsedAmount = ethers.parseUnits(amount, 18);
    if (parsedAmount <= 0n) {
        throw new Error('Transfer amount must be greater than 0');
    }

    const contract = getCraftsContract(true);

    try {
        const tx = await contract.transfer(to, parsedAmount);

        logger.info('CRAFTS transfer initiated', {
            component: 'token-service',
            to,
            amount,
            txHash: tx.hash,
        });

        const receipt = await tx.wait();

        if (receipt.status === 0) {
            throw new Error(`Transfer reverted: ${tx.hash}`);
        }

        logger.info('CRAFTS transfer confirmed', {
            component: 'token-service',
            to,
            amount,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
        });

        return { txHash: tx.hash, amount };
    } catch (error) {
        const mapped = mapWeb3Error(error);
        logger.error('CRAFTS transfer failed', {
            component: 'token-service',
            to,
            amount,
            error: mapped.message,
        });
        throw mapped;
    }
}

/**
 * Approve the marketplace to spend CRAFTS on behalf of the platform signer.
 * @param {string} spender   Marketplace contract address.
 * @param {string} amount    Amount in human-readable units.
 * @returns {Promise<{ txHash: string }>}
 */
async function approveCrafts(spender, amount) {
    if (!ethers.isAddress(spender)) {
        throw new Error(`Invalid spender address: ${spender}`);
    }

    const parsedAmount = ethers.parseUnits(amount, 18);
    const contract = getCraftsContract(true);

    try {
        const tx = await contract.approve(spender, parsedAmount);
        const receipt = await tx.wait();

        logger.info('CRAFTS approval set', {
            component: 'token-service',
            spender,
            amount,
            txHash: tx.hash,
        });

        return { txHash: tx.hash };
    } catch (error) {
        const mapped = mapWeb3Error(error);
        logger.error('CRAFTS approval failed', {
            component: 'token-service',
            spender,
            amount,
            error: mapped.message,
        });
        throw mapped;
    }
}

/**
 * Get CRAFTS token metadata.
 * @returns {Promise<{ name: string, symbol: string, decimals: number, totalSupply: string }>}
 */
async function getTokenInfo() {
    const contract = getCraftsContract(false);
    const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
    ]);

    return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
    };
}

module.exports = {
    getCraftsContract,
    getBalance,
    getNativeBalance,
    transferCrafts,
    approveCrafts,
    getTokenInfo,
};
