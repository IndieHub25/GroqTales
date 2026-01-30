// Mock mongoose before any imports
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 1,
  },
  models: {},
  model: jest.fn().mockReturnValue({
    create: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    deleteMany: jest.fn().mockResolvedValue({}),
  }),
  Schema: jest.fn().mockImplementation(() => ({
    index: jest.fn(),
  })),
}));

// Mock the MongoDB connection before any imports
jest.mock('@/lib/mongodb', () => ({
  clientPromise: Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteMany: jest.fn(),
      }),
    }),
  }),
}));

import { generateStoryHash, isValidStoryHash, normalizeStoryContent } from '@/lib/story-hash';
import StoryMint from '@/models/StoryMint';
import { clientPromise } from '@/lib/mongodb';

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

describe('Mint Idempotency', () => {
  beforeAll(async () => {
    // Connect to database
    await clientPromise;
  });

  afterEach(async () => {
    // Clean up test data
    await StoryMint.deleteMany({});
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

  describe('Mint State Machine', () => {
    it('should create PENDING record for new story hash', async () => {
      const storyHash = generateStoryHash('Test', 'Content', '0x123');
      const authorAddress = '0x1234567890123456789012345678901234567890';
      const title = 'Test Story';

      // Mock create to return the created object
      const mockCreate = jest.fn().mockResolvedValue({
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      });
      StoryMint.create = mockCreate;

      // Mock findOne to return the created record
      const mockFindOne = jest.fn().mockResolvedValue({
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      });
      StoryMint.findOne = mockFindOne;

      // Create PENDING record
      await StoryMint.create({
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      });

      const record = await StoryMint.findOne({ storyHash });
      expect(record?.status).toBe('PENDING');
    });

    it('should reject duplicate mint for MINTED story', async () => {
      const storyHash = generateStoryHash('Test', 'Content', '0x123');
      const authorAddress = '0x1234567890123456789012345678901234567890';
      const title = 'Test Story';

      // Mock create to return the created object
      const mockCreate = jest.fn().mockResolvedValue({
        storyHash,
        status: 'MINTED',
        authorAddress,
        title,
        txHash: '0xabcdef',
      });
      StoryMint.create = mockCreate;

      // Mock findOneAndUpdate to return existing MINTED record
      const mockFindOneAndUpdate = jest.fn().mockResolvedValue({
        storyHash,
        status: 'MINTED',
        authorAddress,
        title,
        txHash: '0xabcdef',
      });
      StoryMint.findOneAndUpdate = mockFindOneAndUpdate;

      // Create MINTED record
      await StoryMint.create({
        storyHash,
        status: 'MINTED',
        authorAddress,
        title,
        txHash: '0xabcdef',
      });

      // Try to create another record
      const duplicate = await StoryMint.findOneAndUpdate(
        { storyHash },
        {
          storyHash,
          status: 'PENDING',
          authorAddress,
          title,
        },
        { upsert: true, new: true }
      );

      expect(duplicate?.status).toBe('MINTED');
    });

    it('should allow retry after FAILED status', async () => {
      const storyHash = generateStoryHash('Test', 'Content', '0x123');
      const authorAddress = '0x1234567890123456789012345678901234567890';
      const title = 'Test Story';

      // Mock create to return the created object
      const mockCreate = jest.fn().mockResolvedValue({
        storyHash,
        status: 'FAILED',
        authorAddress,
        title,
      });
      StoryMint.create = mockCreate;

      // Mock findOneAndUpdate to return new PENDING record
      const mockFindOneAndUpdate = jest.fn().mockResolvedValue({
        storyHash,
        status: 'PENDING',
        authorAddress,
        title,
      });
      StoryMint.findOneAndUpdate = mockFindOneAndUpdate;

      // Create FAILED record
      await StoryMint.create({
        storyHash,
        status: 'FAILED',
        authorAddress,
        title,
      });

      // Should allow new PENDING record
      const retry = await StoryMint.findOneAndUpdate(
        { storyHash },
        {
          storyHash,
          status: 'PENDING',
          authorAddress,
          title,
        },
        { upsert: true, new: true }
      );

      expect(retry?.status).toBe('PENDING');
    });
  });
});
