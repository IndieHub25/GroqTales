import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/dbConnect';
import { getCreatorEarnings } from '@/lib/royalty-service';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/royalties/earnings/[wallet]
 * Fetch earnings summary for a creator by wallet address.
 * Protected: requires authenticated session or internal API key.
 */
export async function GET(
  req: Request,
  { params }: { params: { wallet: string } }
) {
  try {
    const walletAddress = params.wallet.toLowerCase();

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Allow access if: user is authenticated OR internal API key matches
    const internalKey = (req as NextRequest).headers.get('x-internal-api-key');
    const expectedKey = process.env.INTERNAL_API_KEY;
    const isInternalCall = expectedKey && internalKey === expectedKey;

    if (!session && !isInternalCall) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { wallet } = params;

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const earnings = await getCreatorEarnings(wallet);

    return NextResponse.json({ success: true, earnings }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching creator earnings:', error);

    if (error.message?.includes('Invalid wallet')) {
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
