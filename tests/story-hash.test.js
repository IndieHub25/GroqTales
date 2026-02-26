/**
 * Standalone Story Hash Tests
 * 
 * Tests the story hashing functionality without Next.js dependencies.
 * This file replicates the implementation from lib/story-hash.ts to test
 * the hash generation logic.
 * 
 * Run with: node tests/story-hash.test.js
 * Or: npx jest tests/story-hash.test.js
 */

const { createHash } = require('crypto');

// Replicate the production implementation from lib/story-hash.ts
function generateStoryHash(content, authorAddress) {
  const data = `${encodeURIComponent(content)}|${authorAddress}`;
  return createHash('sha256').update(data).digest('hex');
}

function generateContentHash(content) {
  return createHash('sha256').update(content).digest('hex');
}

function isValidStoryHash(hash) {
  return /^[a-f0-9]{64}$/i.test(hash);
}

// Test results storage
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function expect(value) {
  return {
    toBe: (expected) => {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`);
      }
    },
    toBeTruthy: () => {
      if (!value) {
        throw new Error(`Expected truthy, got ${value}`);
      }
    },
    toBeFalsy: () => {
      if (value) {
        throw new Error(`Expected falsy, got ${value}`);
      }
    },
    not: {
      toBe: (expected) => {
        if (value === expected) {
          throw new Error(`Expected not ${expected}, but got ${value}`);
        }
      },
      toContain: (expected) => {
        if (value.includes(expected)) {
          throw new Error(`Expected "${value}" not to contain "${expected}"`);
        }
      }
    }
  };
}

console.log('\n=== Story Hash Tests ===\n');

// Test 1: Same content produces same hash
test('should generate consistent story hash for same content', () => {
  const content = 'Once upon a time in a digital world...';
  const author = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  
  const storyHash1 = generateStoryHash(content, author);
  const storyHash2 = generateStoryHash(content, author);
  
  expect(storyHash1).toBe(storyHash2);
});

// Test 2: Different author produces different hash
test('should generate different hash for different authors', () => {
  const content = 'Once upon a time in a digital world...';
  const author1 = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  const author2 = '0xDifferentAddress';
  
  const storyHash1 = generateStoryHash(content, author1);
  const storyHash2 = generateStoryHash(content, author2);
  
  expect(storyHash1).not.toBe(storyHash2);
});

// Test 3: Content-only hash is consistent
test('should generate consistent content-only hash', () => {
  const content = 'Once upon a time in a digital world...';
  
  const contentHash1 = generateContentHash(content);
  const contentHash2 = generateContentHash(content);
  
  expect(contentHash1).toBe(contentHash2);
});

// Test 4: Valid 64-character hex string
test('should validate valid story hash format', () => {
  const validHash = 'a'.repeat(64);
  expect(isValidStoryHash(validHash)).toBeTruthy();
});

// Test 5: Invalid formats
test('should reject invalid story hash format', () => {
  expect(isValidStoryHash('invalid')).toBeFalsy();
  expect(isValidStoryHash('')).toBeFalsy();
  expect(isValidStoryHash('abc'.repeat(21) + 'abc')).toBeFalsy(); // 66 chars
  expect(isValidStoryHash('zzzz'.repeat(16))).toBeFalsy(); // Non-hex chars
});

// Test 6: Hash length
test('should produce 64-character hex strings', () => {
  const content = 'Test story content';
  const author = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  
  const hash = generateStoryHash(content, author);
  
  expect(hash.length).toBe(64);
});

// Test 7: Security - deterministic hash generation
test('should produce deterministic hashes', () => {
  const content = 'Secret story content';
  const author = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  
  const hash1 = generateStoryHash(content, author);
  const hash2 = generateStoryHash(content, author);
  
  // Same inputs should always produce same hash
  expect(hash1).toBe(hash2);
});

// Test 8: Special characters
test('should handle special characters in content', () => {
  const content = 'Story with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
  const author = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  
  const hash1 = generateStoryHash(content, author);
  const hash2 = generateStoryHash(content, author);
  
  expect(hash1).toBe(hash2);
});

// Test 9: Unicode characters
test('should handle unicode characters in content', () => {
  const content = 'Story with unicode: 你好世界 🔐 NFT 🎭';
  const author = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  
  const hash1 = generateStoryHash(content, author);
  const hash2 = generateStoryHash(content, author);
  
  expect(hash1).toBe(hash2);
});

// Test 10: Empty content handling
test('should handle empty content', () => {
  const content = '';
  const author = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
  
  const hash1 = generateStoryHash(content, author);
  const hash2 = generateStoryHash(content, author);
  
  expect(hash1).toBe(hash2);
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

process.exit(failed > 0 ? 1 : 0);
