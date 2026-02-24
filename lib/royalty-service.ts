import { createClient } from '@/lib/supabase/server';

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

function isValidWallet(address: string): boolean {
  return WALLET_REGEX.test(address);
}

// ── Configure Royalty ──────────────────────────────────────────────

interface ConfigureRoyaltyParams {
  nftId?: string;
  storyId?: string;
  creatorWallet: string;
  royaltyPercentage: number;
}

export async function configureRoyalty(params: ConfigureRoyaltyParams) {
  const { storyId, creatorWallet, royaltyPercentage } = params;

  if (!isValidWallet(creatorWallet)) {
    throw new Error('Invalid creator wallet address');
  }

  if (royaltyPercentage < 0 || royaltyPercentage > 50) {
    throw new Error('Royalty percentage must be between 0 and 50');
  }

  if (!storyId) {
    throw new Error('storyId is required for Supabase royalty configs');
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('royalty_configs')
    .upsert(
      {
        story_id: storyId,
        creator_percentage: royaltyPercentage,
        platform_percentage: 2.5, // default
        updated_at: new Date().toISOString()
      },
      { onConflict: 'story_id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to configure royalty: ${error.message}`);
  }

  return data;
}

// ── Record Royalty Transaction ─────────────────────────────────────

interface RecordTransactionParams {
  nftId: string;
  salePrice: number;
  sellerWallet: string;
  buyerWallet: string;
  txHash?: string;
}

export async function recordRoyaltyTransaction(params: RecordTransactionParams) {
  const { nftId, salePrice, txHash } = params;

  if (salePrice <= 0) {
    throw new Error('Sale price must be greater than 0');
  }

  const supabase = createClient();

  // Look up royalty config for this story (mapping nftId to storyId temporarily)
  const { data: config, error: configError } = await (supabase
    .from('royalty_configs')
    .select('*')
    .eq('story_id', nftId)
    .single() as any);

  if (configError || !config) {
    throw new Error('No active royalty configuration found for this NFT/Story');
  }

  const royaltyAmount = salePrice * (config.creator_percentage / 100);

  // Step 1: Create transaction
  const { data: transaction, error: txError } = await supabase
    .from('royalty_transactions')
    .insert({
      story_id: nftId,
      amount: salePrice,
      currency: 'MON',
      type: 'secondary_sale',
      tx_hash: txHash,
      status: 'completed'
    })
    .select()
    .single();

  if (txError) {
    throw new Error(`Failed to record transaction: ${txError.message}`);
  }

  // Step 2: Update creator earnings
  // In a robust system this would use an RPC call or edge function for atomicity
  const { data: existingEarnings } = await (supabase
    .from('creator_earnings')
    .select('*')
    .eq('wallet_address', params.sellerWallet)
    .single() as any);

  if (existingEarnings) {
    await supabase
      .from('creator_earnings')
      .update({
        total_earned: Number(existingEarnings.total_earned || 0) + royaltyAmount,
        available_to_claim: Number(existingEarnings.available_to_claim || 0) + royaltyAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingEarnings.id);
  } else {
    // We would need creator_id (uuid) ideally, but we default to null if not found
    await supabase.from('creator_earnings').insert({
      wallet_address: params.sellerWallet,
      total_earned: royaltyAmount,
      available_to_claim: royaltyAmount
    });
  }

  return transaction;
}

// ── Get Creator Earnings ───────────────────────────────────────────

const DEFAULT_EARNINGS = {
  totalEarned: 0,
  pendingPayout: 0,
  paidOut: 0,
  totalSales: 0,
  lastUpdated: null,
};

export async function getCreatorEarnings(walletAddress: string) {
  if (!isValidWallet(walletAddress)) {
    throw new Error('Invalid wallet address');
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('creator_earnings')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return { ...DEFAULT_EARNINGS, creatorWallet: walletAddress.toLowerCase() };
  }

  return {
    totalEarned: data.total_earned || 0,
    pendingPayout: data.available_to_claim || 0,
    paidOut: (data.total_earned || 0) - (data.available_to_claim || 0),
    totalSales: 0, // Not explicitly tracked in simple schema
    lastUpdated: data.updated_at,
    creatorWallet: data.wallet_address
  };
}

// ── Get Creator Transactions ───────────────────────────────────────

interface TransactionQueryOptions {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed';
}

export async function getCreatorTransactions(
  walletAddress: string,
  options: TransactionQueryOptions = {}
) {
  if (!isValidWallet(walletAddress)) {
    throw new Error('Invalid wallet address');
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const supabase = createClient();

  let query = supabase
    .from('royalty_transactions')
    .select('*, stories!inner(creator_wallet_address)', { count: 'exact' })
    .eq('stories.creator_wallet_address', walletAddress.toLowerCase());

  if (options.status) {
    query = query.eq('status', options.status);
  }

  const { data: transactions, count, error } = await query
    .order('created_at', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  const total = count || 0;

  return {
    transactions: transactions || [],
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    limit,
  };
}

// ── Get Royalty Config ─────────────────────────────────────────────

interface GetConfigParams {
  nftId?: string;
  storyId?: string;
  creatorWallet?: string;
}

export async function getRoyaltyConfig(params: GetConfigParams) {
  const supabase = createClient();
  let query = supabase.from('royalty_configs').select('*');

  if (params.storyId || params.nftId) {
    query = query.eq('story_id', params.storyId || params.nftId);
    const { data: singleData } = await query.single();
    return singleData || null;
  }

  const { data } = await query;
  return data || [];
}
