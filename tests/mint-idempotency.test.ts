import { generateStoryHash, isValidStoryHash, normalizeStoryContent } from '@/lib/story-hash';
import { handleMintRequest } from '@/lib/mint-service';
import StoryMint from '@/models/StoryMint';

// Mock the groq service for testing
jest.mock('@/lib/groq-service', () => ({
  generateStoryContent: jest.fn().mockResolvedValue('This is a test story content.')
}));

// Mock the monad service
jest.mock('@/lib/monad-service', () => ({
  generateAndMintAIStory: jest.fn().mockResolvedValue({
    tokenId: '1',
    transactionHash: '0x123',
    metadata: {},
    owner: '0x123'
  })
}));

// Mock StoryMint model for testing idempotency logic
jest.mock('@/models/StoryMint', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteMany: jest.fn(),
}));

describe('Mint Idempotency', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test data
    await StoryMint.deleteMany();
  });

  describe('Story Hash Generation', () => {
    it('should generate consistent hashes for identical content', () => {
      const title = 'Test Story';
      const body = 'This is a test story content.';
      const authorAddress = '0x1234567890123456789012345678901234567890';

      const hash1 = generateStoryHash(title, body, authorAddress);
      const hash2 = generateStoryHash(title, body, authorAddress);

      expect(hash1).toBe(hash2);
      expect(isValidStoryHash(hash1)).toBe(true);
    });

    it('should generate different hashes for different content', () => {
      const authorAddress = '0x1234567890123456789012345678901234567890';

      const hash1 = generateStoryHash('Title 1', 'Body 1', authorAddress);
      const hash2 = generateStoryHash('Title 2', 'Body 2', authorAddress);

      expect(hash1).not.toBe(hash2);
      expect(isValidStoryHash(hash1)).toBe(true);
      expect(isValidStoryHash(hash2)).toBe(true);
    });

    it('should normalize content before hashing', () => {
      const authorAddress = '0x1234567890123456789012345678901234567890';

      const hash1 = generateStoryHash('Test Story', 'This is a test.', authorAddress);
      const hash2 = generateStoryHash('  test story  ', '  this is a test.  ', authorAddress);

      expect(hash1).toBe(hash2);
    });

    it('should validate hash format correctly', () => {
      const validHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const invalidHash = 'invalid-hash';

      expect(isValidStoryHash(validHash)).toBe(true);
      expect(isValidStoryHash(invalidHash)).toBe(false);
    });
  });

  describe('Mint State Machine (Integration)', () => {
    it('should create PENDING record for new story hash', async () => {
      const storyHash = generateStoryHash('Test', 'Content', '0x123');
      const authorAddress = '0x1234567890123456789012345678901234567890';
      const title = 'Test Story';

      // Mock no existing record
      (StoryMint.findOne as jest.Mock).mockResolvedValue(null);
      // Mock create to return the created record
      (StoryMint.create as jest.Mock).mockResolvedValue({
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      });

      const result = await handleMintRequest({
        storyHash,
        authorAddress,
        title,
      });

      expect(StoryMint.findOne).toHaveBeenCalledWith({ storyHash });
      expect(StoryMint.create).toHaveBeenCalledWith({
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      });
      expect(result.success).toBe(true);
      expect(result.status).toBe('PENDING');
      expect(result.message).toBe('Mint initiated');
      expect(result.existingRecord?.status).toBe('PENDING');
      expect(result.existingRecord?.authorAddress).toBe(authorAddress);
      expect(result.existingRecord?.title).toBe(title);
    });

    it('should reject duplicate mint for MINTED story', async () => {
      const storyHash = generateStoryHash('Test', 'Content', '0x123');
      const authorAddress = '0x1234567890123456789012345678901234567890';
      const title = 'Test Story';

      const mintedRecord = {
        storyHash,
        status: 'MINTED',
        authorAddress,
        title,
        txHash: '0xabcdef',
      };

      // Mock existing MINTED record
      (StoryMint.findOne as jest.Mock).mockResolvedValue(mintedRecord);

      const result = await handleMintRequest({
        storyHash,
        authorAddress,
        title,
      });

      expect(StoryMint.findOne).toHaveBeenCalledWith({ storyHash });
      expect(StoryMint.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.status).toBe('MINTED');
      expect(result.message).toBe('Story already minted');
      expect(result.existingRecord).toBe(mintedRecord);
    });

    it('should reject mint for PENDING story', async () => {
      const storyHash = generateStoryHash('Test', 'Content', '0x123');
      const authorAddress = '0x1234567890123456789012345678901234567890';
      const title = 'Test Story';

      const pendingRecord = {
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      };

      // Mock existing PENDING record
      (StoryMint.findOne as jest.Mock).mockResolvedValue(pendingRecord);

      const result = await handleMintRequest({
        storyHash,
        authorAddress,
        title,
      });

      expect(StoryMint.findOne).toHaveBeenCalledWith({ storyHash });
      expect(StoryMint.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.status).toBe('PENDING');
      expect(result.message).toBe('Mint already in progress');
      expect(result.existingRecord).toBe(pendingRecord);
    });

    it('should allow retry after FAILED status', async () => {
      const storyHash = generateStoryHash('Test', 'Content', '0x123');
      const authorAddress = '0x1234567890123456789012345678901234567890';
      const title = 'Test Story';

      const failedRecord = {
        storyHash,
        status: 'FAILED',
        authorAddress,
        title,
      };

      const updatedRecord = {
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      };

      // Mock existing FAILED record
      (StoryMint.findOne as jest.Mock).mockResolvedValue(failedRecord);
      // Mock update to return the updated record
      (StoryMint.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedRecord);

      const result = await handleMintRequest({
        storyHash,
        authorAddress,
        title,
      });

      expect(StoryMint.findOne).toHaveBeenCalledWith({ storyHash });
      expect(StoryMint.findOneAndUpdate).toHaveBeenCalledWith(
        { storyHash, status: 'FAILED' },
        {
          storyHash,
          status: 'PENDING',
          authorAddress,
          title,
        },
        { new: true }
      );
      expect(result.success).toBe(true);
      expect(result.status).toBe('PENDING');
      expect(result.message).toBe('Mint retry initiated');
      expect(result.existingRecord).toBe(updatedRecord);
    });
  });
});
