import { NextRequest, NextResponse } from 'next/server';

import { getStoryNFT, mintStoryNFT, StoryMetadata } from '@/lib/monad-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, metadata, ownerAddress, tokenId } = body;

    switch (action) {
      case 'mint': {
        if (!metadata || !ownerAddress) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        // Mint the NFT with correct parameters
        const result = await mintStoryNFT(
          metadata as StoryMetadata,
          ownerAddress
        );

        return NextResponse.json({
          success: true,
          nft: result,
        });
      }

      case 'fetch': {
        if (!tokenId) {
          return NextResponse.json(
            { error: 'Token ID is required' },
            { status: 400 }
          );
        }

        const nft = await getStoryNFT(tokenId);
        if (!nft) {
          return NextResponse.json({ error: 'NFT not found' }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          nft,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Monad API error:', error);
    return NextResponse.json(
      {
        error:
          error.message || 'An error occurred while processing your request',
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      network: {
        name: 'Monad Testnet',
        chainId: 9090,
        rpcUrl: 'https://rpc.testnet.monad.xyz/json-rpc',
        currency: 'MONAD',
      },
    });
  } catch (error: any) {
    console.error('Error fetching Monad info:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching Monad info' },
      { status: 500 }
    );
  }
}
