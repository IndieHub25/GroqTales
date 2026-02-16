import { NextRequest, NextResponse } from 'next/server';

import { generateAndMintAIStory } from '@/lib/monad-service';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, ownerAddress, title, genre, apiKey } = body;
    if (!prompt || !ownerAddress) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters. Prompt and owner address are required.',
        },
        { status: 400 }
      );
    }
    // Generate content with Groq and mint as NFT
    const mintedNFT = await generateAndMintAIStory(
      prompt,
      ownerAddress,
      title,
      genre,
      apiKey
    );
    return NextResponse.json({
      success: true,
      message: 'Successfully generated story and minted as NFT',
      nft: mintedNFT,
    });
  } catch (error: any) {
    console.error('Generate and mint error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          'An error occurred during the generate and mint process',
      },
      { status: 500 }
    );
  }
}
