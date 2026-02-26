import dbConnect from '@/lib/dbConnect';
import StoryMint, { IStoryMint } from '@/models/StoryMint';

export interface MintRequest {
  storyHash: string;
  authorAddress: string;
  title: string;
}

export interface MintResult {
  success: boolean;
  status: 'PENDING' | 'MINTED' | 'FAILED';
  message: string;
  existingRecord?: IStoryMint | null;
}

export async function handleMintRequest(
  request: MintRequest
): Promise<MintResult> {
  const { storyHash, authorAddress, title } = request;

  // Validate request payload before normalization
  if (
    typeof storyHash !== 'string' ||
    typeof authorAddress !== 'string' ||
    typeof title !== 'string' ||
    !storyHash.trim() ||
    !authorAddress.trim()
  ) {
    throw new Error(
      'Invalid mint request payload: storyHash, authorAddress, and title are required and must be non-empty strings'
    );
  }

  // Connect to database
  await dbConnect();

  // Normalize inputs to lowercase for consistent idempotency
  const normalizedStoryHash = storyHash.toLowerCase();
  const normalizedAuthorAddress = authorAddress.toLowerCase();

  // Check for existing mint record - scoped by storyHash + authorAddress
  const existingMint = await StoryMint.findOne({
    storyHash: normalizedStoryHash,
    authorAddress: normalizedAuthorAddress,
  });

  if (existingMint) {
    if (existingMint.status === 'MINTED') {
      return {
        success: false,
        status: 'MINTED',
        message: 'Story already minted',
        existingRecord: existingMint,
      };
    }

    if (existingMint.status === 'PENDING') {
      return {
        success: false,
        status: 'PENDING',
        message: 'Mint already in progress',
        existingRecord: existingMint,
      };
    }

    // For FAILED status, allow retry by updating to PENDING
    if (existingMint.status === 'FAILED') {
      const updatedRecord = await StoryMint.findOneAndUpdate(
        {
          storyHash: normalizedStoryHash,
          authorAddress: normalizedAuthorAddress,
          status: 'FAILED',
        },
        {
          $set: {
            storyHash: normalizedStoryHash,
            status: 'PENDING',
            authorAddress: normalizedAuthorAddress,
            title,
          },
          $unset: {
            error: '',
            txHash: '',
            tokenId: '',
            mintedAt: '',
          },
        },
        { new: true }
      );

      if (!updatedRecord) {
        // Another request already changed the state
        const currentRecord = await StoryMint.findOne({
          storyHash: normalizedStoryHash,
          authorAddress: normalizedAuthorAddress,
        });

        return {
          success: false,
          status: currentRecord?.status ?? 'PENDING',
          message: 'Mint state changed by another request',
          existingRecord: currentRecord,
        };
      }

      return {
        success: true,
        status: 'PENDING',
        message: 'Mint retry initiated',
        existingRecord: updatedRecord,
      };
    }
  }

  // Create new PENDING record for new story
  try {
    const newRecord = await StoryMint.create({
      storyHash: normalizedStoryHash,
      status: 'PENDING',
      authorAddress: normalizedAuthorAddress,
      title,
    });

    return {
      success: true,
      status: 'PENDING',
      message: 'Mint initiated',
      existingRecord: newRecord,
    };
  } catch (err: unknown) {
    // Handle duplicate key error (concurrent mint request)
    if ((err as { code?: number })?.code === 11000) {
      const existingRecord = await StoryMint.findOne({
        storyHash: normalizedStoryHash,
        authorAddress: normalizedAuthorAddress,
      });

      // Handle FAILED status explicitly in duplicate-key fallback messaging
      let message: string;
      switch (existingRecord?.status) {
        case 'MINTED':
          message = 'Story already minted';
          break;
        case 'FAILED':
          message = 'Previous mint attempt failed. Please try again.';
          break;
        case 'PENDING':
        default:
          message = 'Mint already in progress';
          break;
      }

      return {
        success: false,
        status: existingRecord?.status ?? 'PENDING',
        message,
        existingRecord,
      };
    }

    throw err;
  }
}
