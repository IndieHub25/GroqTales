import StoryMint from '@/models/StoryMint';

export interface MintRequest {
  storyHash: string;
  authorAddress: string;
  title: string;
}

export interface MintResult {
  success: boolean;
  status: 'PENDING' | 'MINTED' | 'FAILED';
  message: string;
  existingRecord?: any;
}

export async function handleMintRequest(request: MintRequest): Promise<MintResult> {
  const { storyHash, authorAddress, title } = request;

  // Check for existing mint record
  const existingMint = await StoryMint.findOne({ storyHash });

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
        { storyHash, status: 'FAILED' },
        {
          storyHash,
          status: 'PENDING',
          authorAddress,
          title,
        },
        { new: true }
      );

      if (!updatedRecord) {
        // Another request already changed the state
        const currentRecord = await StoryMint.findOne({ storyHash });

        return {
          success: false,
          status: currentRecord?.status,
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
      storyHash,
      status: 'PENDING',
      authorAddress,
      title,
    });

    return {
      success: true,
      status: 'PENDING',
      message: 'Mint initiated',
      existingRecord: newRecord,
    };
  } catch (err: any) {
    // Handle duplicate key error (concurrent mint request)
    if (err?.code === 11000) {
      const existingRecord = await StoryMint.findOne({ storyHash });

      return {
        success: false,
        status: existingRecord?.status,
        message:
          existingRecord?.status === 'MINTED'
            ? 'Story already minted'
            : 'Mint already in progress',
        existingRecord,
      };
    }

    throw err;
  }
}
