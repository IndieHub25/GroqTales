import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import { getCreatorTransactions } from '@/lib/royalty-service';

/**
 * GET /api/royalties/transactions/[wallet]?page=1&limit=10&status=completed
 * Fetch paginated royalty transaction history for a creator.
 * Protected: requires authenticated session or internal API key.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    // Allow access if: user is authenticated OR internal API key matches
    const session = await getServerSession(authOptions);
    const internalKey = request.headers.get('x-internal-api-key');
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

    const { searchParams } = new URL(request.url);
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
