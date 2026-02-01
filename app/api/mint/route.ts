import { NextRequest, NextResponse } from 'next/server';
import { handleMintRequest } from '@/lib/mint-service';

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

  if (!storyHash || !authorAddress || !title) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters: storyHash, authorAddress, title',
      },
      { status: 400 }
    );
  }

  try {
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
        error: 'An error occurred during minting',
      },
      { status: 500 }
    );
  }
}
