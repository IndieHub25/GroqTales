import { NextRequest, NextResponse } from 'next/server';
import { handleMintRequest } from '@/lib/mint-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyHash, authorAddress, title } = body;

    if (!storyHash || !authorAddress || !title) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: storyHash, authorAddress, title',
        },
        { status: 400 }
      );
    }

    const result = await handleMintRequest({ storyHash, authorAddress, title });

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
        error: error.message || 'An error occurred during minting',
      },
      { status: 500 }
    );
  }
}
