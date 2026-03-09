'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/components/providers/web3-provider';
import type { StoryMetadata, MintedNFT } from '@/lib/ethereum-service';
import { ACTIVE_CHAIN, CHAIN_ID_HEX, isCorrectChain } from '@/lib/chain-config';

const PLACEHOLDER_IPFS_CID = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

const isValidIpfsUri = (uri?: string | null): boolean => {
    if (!uri) return false;
    return uri.startsWith('ipfs://') || uri.startsWith('Qm') || uri.startsWith('bafy');
};

type EthereumNetworkInfo = {
    chainId: number;
    name: string;
    rpcUrl: string;
    currency: string;
    explorerUrl: string;
};

type UseEthereumResult = {
    account: string | null;
    connected: boolean;
    loading: boolean;
    error: string | null;
    mintedNFTs: MintedNFT[];
    networkInfo: EthereumNetworkInfo | null;
    mintStoryNFT: (metadata: StoryMetadata) => Promise<MintedNFT>;
    switchToEthereumNetwork: () => Promise<boolean>;
    isOnEthereumNetwork: boolean;
};

export function useEthereum(): UseEthereumResult {
    const { account, connected, chainId } = useWeb3();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [networkInfo, setNetworkInfo] = useState<EthereumNetworkInfo | null>(null);
    const [isOnEthereumNetwork, setIsOnEthereumNetwork] = useState(false);
    const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([]);

    // Set network info from chain config
    useEffect(() => {
        setNetworkInfo({
            chainId: ACTIVE_CHAIN.chainId,
            name: ACTIVE_CHAIN.name,
            rpcUrl: ACTIVE_CHAIN.rpcUrl,
            currency: ACTIVE_CHAIN.nativeCurrency.symbol,
            explorerUrl: ACTIVE_CHAIN.explorerUrl,
        });
    }, []);

    // Check if user is on the correct network
    useEffect(() => {
        if (chainId) {
            setIsOnEthereumNetwork(isCorrectChain(chainId));
        }
    }, [chainId]);

    /**
     * Switch to Ethereum mainnet network
     */
    const switchToEthereumNetwork = useCallback(async (): Promise<boolean> => {
        if (typeof window === 'undefined' || !window.ethereum) return false;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CHAIN_ID_HEX }],
            });
            setIsOnEthereumNetwork(true);
            return true;
        } catch (err: any) {
            console.error('Error switching to Ethereum network:', err);
            setError('Failed to switch to Ethereum mainnet');
            return false;
        }
    }, []);

    /**
     * Mint a story as an NFT on Ethereum mainnet
     */
    const mintStoryNFT = useCallback(
        async (metadata: StoryMetadata): Promise<MintedNFT> => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            setLoading(true);
            setError(null);

            try {
                if (!isOnEthereumNetwork) {
                    const switched = await switchToEthereumNetwork();
                    if (!switched) {
                        setError('Must be on Ethereum mainnet to mint NFTs');
                        throw new Error('Must be on Ethereum mainnet to mint NFTs');
                    }
                }

                if (!metadata.id) {
                    const msg = 'Story ID missing from metadata. Cannot mint.';
                    setError(msg);
                    throw new Error(msg);
                }

                if (!isValidIpfsUri(metadata.coverImage)) {
                    const msg = 'Valid IPFS cover image URI is required to mint. Must be a CID or ipfs:// URI.';
                    setError(msg);
                    throw new Error(msg);
                }

                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
                const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

                // Direct mint natively on the backend via Alchemy
                const response = await fetch(`${baseUrl}/api/v1/nft/eth-mainnet/mint`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        toAddress: account,
                        tokenUri: metadata.coverImage || PLACEHOLDER_IPFS_CID,
                    }),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error || `Mint failed: ${response.statusText}`);
                }

                const data = await response.json();

                const result: MintedNFT = {
                    tokenId: data.tokenId || 'pending',
                    transactionHash: data.txHash || 'pending',
                    metadata: { ...metadata, authorAddress: account },
                    contractAddress: process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT || undefined,
                };

                setMintedNFTs((prev) => [...prev, result]);
                return result;
            } catch (err: any) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [account, isOnEthereumNetwork, switchToEthereumNetwork]
    );

    return {
        account,
        connected,
        loading,
        error,
        mintedNFTs,
        networkInfo,
        mintStoryNFT,
        switchToEthereumNetwork,
        isOnEthereumNetwork,
    };
}

/**
 * @deprecated Use useEthereum instead.
 * Kept for backward compatibility.
 */
export const useMonad = useEthereum;
