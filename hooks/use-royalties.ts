'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────

export interface CreatorEarnings {
  creatorWallet: string;
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;
  totalSales: number;
  lastUpdated: string | null;
}

export interface RoyaltyTransaction {
  _id: string;
  nftId: string;
  salePrice: number;
  royaltyAmount: number;
  royaltyPercentage: number;
  sellerWallet: string;
  buyerWallet: string;
  creatorWallet: string;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface RoyaltyConfig {
  _id: string;
  nftId?: string;
  storyId?: string;
  creatorWallet: string;
  royaltyPercentage: number;
  isActive: boolean;
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ── useCreatorEarnings ─────────────────────────────────────────────

export function useCreatorEarnings(walletAddress: string | undefined) {
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/royalties/earnings/${walletAddress}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch earnings');
      }

      setEarnings(data.earnings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch earnings');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return { earnings, isLoading, error, refetch: fetchEarnings };
}

// ── useCreatorTransactions ─────────────────────────────────────────

export function useCreatorTransactions(
  walletAddress: string | undefined,
  page = 1,
  limit = 10
) {
  const [transactions, setTransactions] = useState<RoyaltyTransaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const res = await fetch(
        `/api/royalties/transactions/${walletAddress}?${params}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, page, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, pagination, isLoading, error, refetch: fetchTransactions };
}

// ── useRoyaltyConfig ───────────────────────────────────────────────

export function useRoyaltyConfig(params: {
  nftId?: string;
  storyId?: string;
  creatorWallet?: string;
}) {
  const [config, setConfig] = useState<RoyaltyConfig | RoyaltyConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasParams = params.nftId || params.storyId || params.creatorWallet;

  const fetchConfig = useCallback(async () => {
    if (!hasParams) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params.nftId) searchParams.set('nftId', params.nftId);
      if (params.storyId) searchParams.set('storyId', params.storyId);
      if (params.creatorWallet) searchParams.set('creatorWallet', params.creatorWallet);

      const res = await fetch(`/api/royalties/configure?${searchParams}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setConfig(null);
          return;
        }
        throw new Error(data.error || 'Failed to fetch config');
      }

      setConfig(data.config);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch config');
    } finally {
      setIsLoading(false);
    }
  }, [params.nftId, params.storyId, params.creatorWallet, hasParams]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, isLoading, error, refetch: fetchConfig };
}

// ── useConfigureRoyalty ────────────────────────────────────────────

export function useConfigureRoyalty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configure = useCallback(
    async (params: {
      nftId?: string;
      storyId?: string;
      creatorWallet: string;
      royaltyPercentage: number;
    }): Promise<RoyaltyConfig | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/royalties/configure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to configure royalty');
        }

        return data.config;
      } catch (err: any) {
        setError(err.message || 'Failed to configure royalty');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { configure, isLoading, error };
}
