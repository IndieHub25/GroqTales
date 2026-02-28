import { NextRequest, NextResponse } from 'next/server';
import StoryMint from '@/models/StoryMint';
import dbConnect from '@/lib/dbConnect';
import { RateLimiter } from '@/lib/api-utils';
import { isValidStoryHash } from '@/lib/story-hash';

// Rate limit: 60 requests per minute per wallet
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { storyHash, authorAddress } = body;

  // Validate storyHash
  if (!storyHash || typeof storyHash !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid parameter: storyHash' },
      { status: 400 }
    );
  }

  // Canonicalize storyHash to lowercase for consistent queries
  const trimmedHash = storyHash.trim().toLowerCase();
  if (!trimmedHash || !isValidStoryHash(trimmedHash)) {
    return NextResponse.json(
      { success: false, error: 'Invalid storyHash format' },
      { status: 400 }
    );
  }

  // Wallet address is REQUIRED for security - prevents enumeration attacks
  // Must be provided either in body or as a header
  const bodyWallet = authorAddress?.trim()?.toLowerCase();
  const headerWallet = request.headers.get('x-wallet-address')?.toLowerCase();
  const walletAddress = bodyWallet || headerWallet;
  
  if (!walletAddress) {
    return NextResponse.json(
      { success: false, error: 'Wallet address required for mint status check' },
      { status: 400 }
    );
  }

  // Apply rate limiting per wallet BEFORE opening DB connection
  // This prevents rate-limited requests from consuming DB resources
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

  // Connect to database AFTER rate limiting check
  await dbConnect();

  try {
    // SECURE: Query is ALWAYS scoped to the wallet address
    // This prevents users from enumerating other users' mint records
    const query = { 
      storyHash: trimmedHash,
      authorAddress: walletAddress.toLowerCase()
    };

    const existingMint = await StoryMint.findOne(query);

    if (!existingMint) {
      return NextResponse.json({
        success: true,
        status: 'NOT_MINTED',
        message: 'Story has not been minted yet',
      });
    }

    return NextResponse.json({
      success: true,
      status: existingMint.status,
      message:
        existingMint.status === 'MINTED'
          ? 'Story has already been minted'
          : existingMint.status === 'PENDING'
          ? 'Mint is in progress'
          : 'Previous mint attempt failed',
      record: existingMint,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Check mint status error:', errMsg);
    return NextResponse.json(
      { success: false, error: 'An error occurred while checking mint status' },
      { status: 500 }
    );
  }
}
