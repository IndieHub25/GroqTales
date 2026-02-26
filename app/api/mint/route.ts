import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleMintRequest } from '@/lib/mint-service';
import { RateLimiter } from '@/lib/api-utils';
import { isValidStoryHash } from '@/lib/story-hash';

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  wallet?: string;
}

// Rate limit: 60 requests per minute per wallet
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: NextRequest) {
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

  const { storyHash, authorAddress, title } = body;

  // Validate required parameters
  if (!storyHash || !title || !authorAddress) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters: storyHash, title, authorAddress',
      },
      { status: 400 }
    );
  }

  // Validate storyHash format
  const trimmedHash = storyHash.trim();
  if (!isValidStoryHash(trimmedHash)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid storyHash format',
      },
      { status: 400 }
    );
  }

  // Use the provided wallet address for minting and rate limiting
  const walletAddress = authorAddress.trim().toLowerCase();

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
