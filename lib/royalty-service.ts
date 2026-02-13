import RoyaltyConfig, { IRoyaltyConfig } from '../models/RoyaltyConfig';
import RoyaltyTransaction, { IRoyaltyTransaction } from '../models/RoyaltyTransaction';
import CreatorEarnings, { ICreatorEarnings } from '../models/CreatorEarnings';

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

export async function configureRoyalty(
  params: ConfigureRoyaltyParams
): Promise<IRoyaltyConfig> {
  const { nftId, storyId, creatorWallet, royaltyPercentage } = params;

  if (!isValidWallet(creatorWallet)) {
    throw new Error('Invalid creator wallet address');
  }

  if (royaltyPercentage < 0 || royaltyPercentage > 50) {
    throw new Error('Royalty percentage must be between 0 and 50');
  }

  if (!nftId && !storyId) {
    throw new Error('Either nftId or storyId is required');
  }

  // Filter on nftId or storyId alone to ensure unique config per asset
  const filter: Record<string, unknown> = {};
  if (nftId) {
    filter.nftId = nftId;
  } else if (storyId) {
    filter.storyId = storyId;
  }

  const config = await RoyaltyConfig.findOneAndUpdate(
    filter,
    {
      ...filter,
      creatorWallet: creatorWallet.toLowerCase(),
      royaltyPercentage,
      isActive: true,
    },
    { upsert: true, new: true, runValidators: true }
  );

  return config;
}

// ── Record Royalty Transaction ─────────────────────────────────────

interface RecordTransactionParams {
  nftId: string;
  salePrice: number;
  sellerWallet: string;
  buyerWallet: string;
  txHash?: string;
}

export async function recordRoyaltyTransaction(
  params: RecordTransactionParams
): Promise<IRoyaltyTransaction> {
  const { nftId, salePrice, sellerWallet, buyerWallet, txHash } = params;

  if (salePrice <= 0) {
    throw new Error('Sale price must be greater than 0');
  }

  if (!isValidWallet(sellerWallet) || !isValidWallet(buyerWallet)) {
    throw new Error('Invalid wallet address');
  }

  // Look up royalty config for this NFT
  const config = await RoyaltyConfig.findOne({
    nftId,
    isActive: true,
  });

  if (!config) {
    throw new Error('No active royalty configuration found for this NFT');
  }

  const royaltyAmount = salePrice * (config.royaltyPercentage / 100);

  // Step 1: Create transaction as pending
  const transaction = await RoyaltyTransaction.create({
    nftId,
    salePrice,
    royaltyAmount,
    royaltyPercentage: config.royaltyPercentage,
    sellerWallet: sellerWallet.toLowerCase(),
    buyerWallet: buyerWallet.toLowerCase(),
    creatorWallet: config.creatorWallet,
    txHash,
    status: 'pending',
  });

  try {
    // Step 2: Update creator earnings atomically
    await CreatorEarnings.findOneAndUpdate(
      { creatorWallet: config.creatorWallet },
      {
        $inc: { totalEarned: royaltyAmount, pendingPayout: royaltyAmount, totalSales: 1 },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true }
    );

    // Step 3: Mark transaction as completed
    transaction.status = 'completed';
    await transaction.save();
  } catch (earningsError) {
    // If earnings update fails, mark transaction as failed
    transaction.status = 'failed';
    await transaction.save();
    throw earningsError;
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

export async function getCreatorEarnings(
  walletAddress: string
): Promise<ICreatorEarnings | typeof DEFAULT_EARNINGS> {
  if (!isValidWallet(walletAddress)) {
    throw new Error('Invalid wallet address');
  }

  const earnings = await CreatorEarnings.findOne({
    creatorWallet: walletAddress.toLowerCase(),
  });

  return earnings || { ...DEFAULT_EARNINGS, creatorWallet: walletAddress.toLowerCase() };
}

// ── Get Creator Transactions ───────────────────────────────────────

interface TransactionQueryOptions {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed';
}

interface PaginatedTransactions {
  transactions: IRoyaltyTransaction[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export async function getCreatorTransactions(
  walletAddress: string,
  options: TransactionQueryOptions = {}
): Promise<PaginatedTransactions> {
  if (!isValidWallet(walletAddress)) {
    throw new Error('Invalid wallet address');
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    creatorWallet: walletAddress.toLowerCase(),
  };
  if (options.status) {
    filter.status = options.status;
  }

  const [transactions, total] = await Promise.all([
    RoyaltyTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    RoyaltyTransaction.countDocuments(filter),
  ]);

  return {
    transactions: transactions as IRoyaltyTransaction[],
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

export async function getRoyaltyConfig(
  params: GetConfigParams
): Promise<IRoyaltyConfig | IRoyaltyConfig[] | null> {
  const filter: Record<string, unknown> = {};

  if (params.nftId) filter.nftId = params.nftId;
  if (params.storyId) filter.storyId = params.storyId;
  if (params.creatorWallet) {
    if (!isValidWallet(params.creatorWallet)) {
      throw new Error('Invalid wallet address');
    }
    filter.creatorWallet = params.creatorWallet.toLowerCase();
  }

  if (Object.keys(filter).length === 0) {
    throw new Error('At least one filter parameter is required');
  }

  // Single lookup for nftId or storyId, list for creatorWallet
  if (params.nftId || params.storyId) {
    return RoyaltyConfig.findOne(filter);
  }

  return RoyaltyConfig.find(filter);
}
