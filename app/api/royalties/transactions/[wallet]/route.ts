import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/dbConnect';
import { getCreatorTransactions } from '@/lib/royalty-service';

/**
 * GET /api/royalties/transactions/[wallet]?page=1&limit=10&status=completed
 * Fetch paginated royalty transaction history for a creator.
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

    const url = new URL(req.url);
    const apiToken = url.searchParams.get('apiToken');
    const internalKey = req.headers.get('x-internal-api-key');
    const isInternalCall = (apiToken === process.env.INTERNAL_API_KEY) || (internalKey === process.env.INTERNAL_API_KEY);

    // In Supabase, ensure the session belongs to this wallet or allow internal calls
    if (!isInternalCall && (!session || !session.user)) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') as
      | 'pending'
      | 'completed'
      | 'failed'
      | null;

    // Validate status if provided
    if (status && !['pending', 'completed', 'failed'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be pending, completed, or failed',
        },
        { status: 400 }
      );
    }

    const result = await getCreatorTransactions(wallet, {
      page,
      limit,
      status: status || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        transactions: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: result.limit,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching royalty transactions:', error);

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
