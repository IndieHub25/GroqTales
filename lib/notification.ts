// import type FrameNotificationDetails from '@farcaster/frame-sdk';
import { redis } from './redis';

const notificationServiceKey =
  process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? 'minikit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FrameNotificationDetails = any;

/**
 * Gets the Redis key for user notification details
 * @param fid - The Farcaster ID
 * @returns The Redis key string
 */
function getUserNotificationDetailsKey(fid: number): string {
  return `${notificationServiceKey}:user:${fid}`;
}

/**
 * Retrieves user notification details from Redis
 * @param fid - The Farcaster ID
 * @returns The notification details or null if not found
 */
export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  if (!redis) {
    return null;
  }
  return await redis.get(getUserNotificationDetailsKey(fid));
}

/**
 * Sets user notification details in Redis
 * @param fid - The Farcaster ID
 * @param notificationDetails - The notification details to store
 */
export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  if (!redis) {
    return;
  }
  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

/**
 * Deletes user notification details from Redis
 * @param fid - The Farcaster ID
 */
export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  if (!redis) {
    return;
  }
  await redis.del(getUserNotificationDetailsKey(fid));
}
