/**
 * Chain Configuration — Ethereum Mainnet via Alchemy
 *
 * Central configuration module for blockchain network settings.
 * All sensitive values (RPC URLs, API keys) are read from environment variables.
 * The active network is controlled via ETHEREUM_CHAIN_ID (defaults to 1 = mainnet).
 *
 * To switch networks (e.g., for staging on a testnet), change the env vars —
 * no code changes required.
 */

export interface ChainConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    wsUrl: string;
    explorerUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
}

const parsedChainId = parseInt(process.env.ETHEREUM_CHAIN_ID || '1', 10);
if (!Number.isFinite(parsedChainId) || Number.isNaN(parsedChainId) || parsedChainId <= 0) {
    throw new Error('Invalid ETHEREUM_CHAIN_ID environment variable: must be a positive integer');
}
const VALIDATED_CHAIN_ID = parsedChainId;

/**
 * The active chain configuration.
 * Reads from environment variables at runtime:
 *   - ALCHEMY_ETH_MAINNET_HTTP_URL  → JSON-RPC endpoint
 *   - ALCHEMY_ETH_MAINNET_WS_URL   → WebSocket endpoint
 *   - ETHEREUM_CHAIN_ID             → Chain ID (default: 1)
 */
export const ACTIVE_CHAIN: ChainConfig = {
    chainId: VALIDATED_CHAIN_ID,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ALCHEMY_ETH_MAINNET_HTTP_URL || '',
    wsUrl: process.env.ALCHEMY_ETH_MAINNET_WS_URL || '',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
};

/**
 * Contract addresses — read from environment variables.
 * Never hardcoded; set in .env.local / deployment secrets.
 */
export const CONTRACTS = {
    storyNFT: process.env.STORY_NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT || '',
    marketplace: process.env.CRAFTS_MARKETPLACE_ADDRESS || process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '',
    craftsToken: process.env.CRAFTS_TOKEN_ADDRESS || '',
};

/**
 * Alchemy API key (for SDK usage, not embedded in RPC URL).
 */
export const ALCHEMY_API_KEY =
    process.env.ALCHEMY_ETH_MAINNET_API_KEY ||
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ||
    '';

/** Hex representation of the active chain ID for wallet RPC calls */
export const CHAIN_ID_HEX = `0x${ACTIVE_CHAIN.chainId.toString(16)}`;

/**
 * Returns the Etherscan URL for a given address or transaction.
 */
export function getExplorerUrl(type: 'address' | 'tx', hash: string): string {
    return `${ACTIVE_CHAIN.explorerUrl}/${type}/${hash}`;
}

/**
 * Checks if a given chain ID matches the active chain.
 */
export function isCorrectChain(chainId: number | null): boolean {
    return chainId === ACTIVE_CHAIN.chainId;
}
