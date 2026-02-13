import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Story from '../../../../models/Story';
import { BLOCKCHAIN_CONFIG, VALIDATION_PATTERNS } from '@/lib/constants';
import { checkTxStatus } from '@/lib/blockchain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = (searchParams.get('wallet') || '').trim().toLowerCase();

    if (!wallet || !VALIDATION_PATTERNS.walletAddress.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    await dbConnect();

    const stories = await Story.find({ authorWallet: wallet })
      .select({
        _id: 1,
        title: 1,
        status: 1,
        ipfsHash: 1,
        nftTxHash: 1,
        nftTokenId: 1,
        updatedAt: 1,
      })
      .sort({ updatedAt: -1 })
      .lean();

    const explorerBase = BLOCKCHAIN_CONFIG.networks.monad.explorerUrl;
    const contract = BLOCKCHAIN_CONFIG.contracts.storyNFT || '';

    const candidates = stories.filter((story: any) => story.status !== 'draft');

    const payload = await Promise.all(candidates.map(async (story: any) => {
        const txHash = story.nftTxHash || undefined;
        let tokenId = story.nftTokenId || undefined;
        const status = story.status || 'draft';
        let syncStatus: 'missing' | 'pending' | 'confirmed' | 'failed' =
          status === 'failed'
            ? 'failed'
            : tokenId
              ? 'confirmed'
              : txHash || status === 'publishing'
                ? 'pending'
                : 'missing';

        if (txHash && syncStatus === 'pending') {
          try {
            const chainStatus = await checkTxStatus(txHash);
            if (chainStatus.status === 'confirmed') {
              syncStatus = 'confirmed';
              tokenId = tokenId || (chainStatus as any).tokenId || undefined;
            } else if (chainStatus.status === 'reverted') {
              syncStatus = 'failed';
            }
          } catch {
          }
        }

        const explorer = {
          tx: txHash ? `${explorerBase}/tx/${txHash}` : undefined,
          token: contract && tokenId ? `${explorerBase}/token/${contract}?a=${tokenId}` : undefined,
          contract: contract ? `${explorerBase}/address/${contract}` : undefined,
        };

        return {
          storyId: story._id.toString(),
          title: story.title || 'Untitled',
          status,
          ipfsHash: story.ipfsHash || undefined,
          nftTxHash: txHash,
          nftTokenId: tokenId,
          syncStatus,
          explorer,
          updatedAt: story.updatedAt ? new Date(story.updatedAt).getTime() : Date.now(),
        };
      }));

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

