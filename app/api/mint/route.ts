import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleMintRequest } from '@/lib/mint-service';
import { RateLimiter } from '@/lib/api-utils';
import { isValidStoryHash } from '@/lib/story-hash';

// Rate limit: 60 requests per minute per wallet
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: NextRequest) {
  // CRITICAL: Verify authentication
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Please log in to mint stories' },
      { status: 401 }
    );
  }

  // Get wallet address from session (set by wallet connection)
  // @ts-ignore - NextAuth session can be extended with custom properties
  const walletAddress = session.user.address || session.user.wallet;

  if (!walletAddress) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Wallet not connected' },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON in request body',
      },
      { status: 400 }
    );
  }

  // Type validation for string parameters
  const { storyHash, title } = body;

  if (
    typeof storyHash !== 'string' ||
    typeof title !== 'string'
  ) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters: storyHash, title',
      },
      { status: 400 }
    );
  }

  // Validate storyHash format
  const trimmedHash = storyHash.trim();
  if (!trimmedHash || !isValidStoryHash(trimmedHash)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid storyHash format',
      },
      { status: 400 }
    );
  }

  // Use the authenticated wallet address for minting and rate limiting
  const authorAddress = walletAddress.toLowerCase();

  // Apply rate limiting per wallet
  const rateLimitResult = RateLimiter.checkRateLimit(
    walletAddress,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }
  try {
    // Use the authenticated wallet address for minting
    const result = await handleMintRequest({ 
      storyHash: trimmedHash, 
      authorAddress: walletAddress, 
      title: title.trim() 
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          status: result.status,
          record: result.existingRecord,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      status: result.status,
      record: result.existingRecord,
    });
  } catch (error: any) {
    console.error('Mint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during minting',
      },
      { status: 500 }
    );
  }
}
