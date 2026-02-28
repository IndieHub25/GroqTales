import { createHash } from 'crypto';

/**
 * Generates a unique hash for story content to enable idempotent minting
 * @param content - The story content to hash
 * @param authorAddress - The author's wallet address
 * @returns A SHA-256 hash of the content
 */
export function generateStoryHash(content: string, authorAddress: string): string {
  const data = `${encodeURIComponent(content)}|${authorAddress}`;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Generates a content-only hash (for duplicate detection)
 * @param content - The story content to hash
 * @returns A SHA-256 hash of the content
 */
export function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Validates that a story hash is properly formatted
 * @param hash - The hash to validate
 * @returns boolean indicating if the hash is valid
 */
export function isValidStoryHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}
