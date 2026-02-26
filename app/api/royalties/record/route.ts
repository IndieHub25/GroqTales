import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/dbConnect';
import { recordRoyaltyTransaction } from '@/lib/royalty-service';

/**
 * POST /api/royalties/record
 * Record a royalty transaction when an NFT sale occurs.
 * Protected: requires authenticated session or internal API key.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Internal API bypass (for webhooks or system services)
    const authHeader = req.headers.get('authorization');
    const isSystemCall = authHeader === `Bearer ${process.env.INTERNAL_API_KEY} `;

    if (!isSystemCall && (!session || !session.user)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const { nftId, salePrice, sellerWallet, buyerWallet, txHash } = body;

    // Validate required fields
    if (!nftId) {
      return NextResponse.json(
        { success: false, error: 'nftId is required' },
        { status: 400 }
      );
    }

    if (typeof nftId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid nftId format' },
        { status: 400 }
      );
    }

    if (
      salePrice === undefined ||
      salePrice === null ||
      typeof salePrice !== 'number' ||
      isNaN(salePrice) ||
      salePrice <= 0
    ) {
      return NextResponse.json(
        { success: false, error: 'salePrice must be a positive number' },
        { status: 400 }
      );
    }

    if (!sellerWallet) {
      return NextResponse.json(
        { success: false, error: 'sellerWallet is required' },
        { status: 400 }
      );
    }

    if (!buyerWallet) {
      return NextResponse.json(
        { success: false, error: 'buyerWallet is required' },
        { status: 400 }
      );
    }

    const transaction = await recordRoyaltyTransaction({
      nftId,
      salePrice,
      sellerWallet,
      buyerWallet,
      txHash,
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording royalty transaction:', error);

    if (
      error.message?.includes('Invalid') ||
      error.message?.includes('must be') ||
      error.message?.includes('No active royalty')
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
