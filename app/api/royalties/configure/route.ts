import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import { configureRoyalty, getRoyaltyConfig } from '@/lib/royalty-service';

/**
 * POST /api/royalties/configure
 * Create or update a royalty configuration for an NFT or story.
 * Protected: requires authenticated session.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const { nftId, storyId, creatorWallet, royaltyPercentage } = body;

    if (!creatorWallet) {
      return NextResponse.json(
        { success: false, error: 'creatorWallet is required' },
        { status: 400 }
      );
    }

    if (
      royaltyPercentage === undefined ||
      royaltyPercentage === null ||
      typeof royaltyPercentage !== 'number' ||
      isNaN(royaltyPercentage)
    ) {
      return NextResponse.json(
        { success: false, error: 'royaltyPercentage must be a number' },
        { status: 400 }
      );
    }

    if (!nftId && !storyId) {
      return NextResponse.json(
        { success: false, error: 'Either nftId or storyId is required' },
        { status: 400 }
      );
    }

    if (nftId && !mongoose.Types.ObjectId.isValid(nftId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid nftId' },
        { status: 400 }
      );
    }

    if (storyId && !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid storyId' },
        { status: 400 }
      );
    }

    const config = await configureRoyalty({
      nftId,
      storyId,
      creatorWallet,
      royaltyPercentage,
    });

    return NextResponse.json({ success: true, config }, { status: 200 });
  } catch (error: any) {
    console.error('Error configuring royalty:', error);

    if (
      error.message?.includes('Invalid') ||
      error.message?.includes('must be')
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/royalties/configure?nftId=xxx&storyId=xxx&creatorWallet=xxx
 * Fetch royalty configuration by nftId, storyId, or creatorWallet.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const nftId = searchParams.get('nftId') || undefined;
    const storyId = searchParams.get('storyId') || undefined;
    const creatorWallet = searchParams.get('creatorWallet') || undefined;

    if (!nftId && !storyId && !creatorWallet) {
      return NextResponse.json(
        {
          success: false,
          error:
            'At least one query parameter is required (nftId, storyId, or creatorWallet)',
        },
        { status: 400 }
      );
    }

    const config = await getRoyaltyConfig({ nftId, storyId, creatorWallet });

    if (!config || (Array.isArray(config) && config.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'No royalty configuration found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, config }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching royalty config:', error);

    if (error.message?.includes('Invalid')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
