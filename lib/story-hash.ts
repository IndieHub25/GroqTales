import { createHash } from 'crypto';

/**
 * Normalizes story content by trimming whitespace and converting to lowercase
 */
export function normalizeStoryContent(content: string): string {
  return content.trim().toLowerCase();
}

/**
 * Generates a consistent hash for a story based on title, body, and author address
 */
export function generateStoryHash(title: string, body: string, authorAddress: string): string {
  const normalizedTitle = normalizeStoryContent(title);
  const normalizedBody = normalizeStoryContent(body);
  const normalizedAuthor = authorAddress.toLowerCase().trim();

  const data = `${normalizedTitle}|${normalizedBody}|${normalizedAuthor}`;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Validates if a string is a valid story hash (64 character hex string)
 */
export function isValidStoryHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash);
}
