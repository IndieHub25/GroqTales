/**
 * MongoDB Connection Utility with Retry Logic
 * Implements exponential backoff for resilient database connections
 * Part of Issue #166: Database Connection Retries and Health Check Endpoint
 */

import { MongoClient, Db } from 'mongodb';

interface ConnectionConfig {
  uri: string;
  maxRetries: number;
  retryDelayMs: number;
}

interface ConnectionState {
  client: MongoClient | null;
  isConnected: boolean;
  lastError: string | null;
  connectionAttempts: number;
  lastConnectionTime: Date | null;
}

// Global connection state
const state: ConnectionState = {
  client: null,
  isConnected: false,
  lastError: null,
  connectionAttempts: 0,
  lastConnectionTime: null,
};

// Guard against concurrent connection attempts
let connectionPromise: Promise<MongoClient> | null = null;

/**
 * Sanitizes MongoDB URI to prevent credential exposure in logs
 */
function sanitizeUri(uri: string): string {
  try {
    const url = new URL(uri);
    if (url.username || url.password) {
      return uri.replace(/\/\/[^@]+@/, '//*****:*****@');
    }
    return uri;
  } catch {
    return '[invalid-uri]';
  }
}

/**
 * Connects to MongoDB with exponential backoff retry logic
 * @param config Connection configuration
 * @returns Connected MongoClient instance
 */
export async function connectWithRetry(
  config: ConnectionConfig
): Promise<MongoClient> {
  // Return existing client if already connected
  if (state.client && state.isConnected) {
    return state.client;
  }

  // Return in-progress connection to avoid concurrent attempts
  if (connectionPromise) {
    return connectionPromise;
  }

  const { uri, maxRetries, retryDelayMs } = config;
  const sanitizedUri = sanitizeUri(uri);

  connectionPromise = (async () => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `[DB] Connection attempt ${attempt}/${maxRetries} to ${sanitizedUri}`
        );
        state.connectionAttempts = attempt;

        const client = new MongoClient(uri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        await client.connect();

        // Verify connection with ping
        try {
          const adminDb = client.db().admin();
          await adminDb.ping();
        } catch (pingError) {
          await client.close();
          throw pingError;
        }

        // Update state
        state.client = client;
        state.isConnected = true;
        state.lastError = null;
        state.lastConnectionTime = new Date();

        console.log(`[DB] Connected successfully on attempt ${attempt}`);
        return client;
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        state.lastError = errorMessage;

        // Calculate exponential backoff delay
        const delay = retryDelayMs * Math.pow(2, attempt - 1);

        console.error(
          `[DB] Attempt ${attempt}/${maxRetries} failed: ${errorMessage}`
        );

        if (attempt === maxRetries) {
          console.error(
            '[DB] Max retries reached. Failed to establish connection.'
          );
          state.isConnected = false;
          throw new Error(
            `Failed to connect to MongoDB after ${maxRetries} attempts: ${errorMessage}`
          );
        }

        console.log(`[DB] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // TypeScript exhaustiveness check
    throw new Error('Unexpected end of retry loop');
  })();

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
}

/**
 * Gets the current MongoDB client instance
 */
export function getClient(): MongoClient | null {
  return state.client;
}

/**
 * Gets the current connection status
 */
export function getConnectionStatus(): boolean {
  return state.isConnected;
}

/**
 * Gets detailed connection state information
 */
export function getConnectionState(): Readonly<ConnectionState> {
  return { ...state };
}

/**
 * Gets the database instance
 */
export function getDatabase(dbName?: string): Db | null {
  if (!state.client || !state.isConnected) {
    return null;
  }
  return state.client.db(dbName);
}

/**
 * Closes the MongoDB connection gracefully
 */
export async function closeConnection(): Promise<void> {
  if (state.client) {
    try {
      await state.client.close();
      state.isConnected = false;
      state.client = null;
      state.lastError = null;
      state.connectionAttempts = 0;
      state.lastConnectionTime = null;
      console.log('[DB] Connection closed gracefully');
    } catch (error: any) {
      console.error('[DB] Error closing connection:', error.message);
      throw error;
    }
  }
}

/**
 * Measures database latency by performing a ping operation
 * @returns Latency in milliseconds, or null if not connected
 */
export async function measureLatency(): Promise<number | null> {
  if (!state.client || !state.isConnected) {
    return null;
  }

  try {
    const startTime = Date.now();
    await state.client.db().admin().ping();
    const latencyMs = Date.now() - startTime;
    return latencyMs;
  } catch (error) {
    console.error('[DB] Error measuring latency:', error);
    state.isConnected = false;
    state.lastError = error instanceof Error ? error.message : 'Ping failed';
    
    // Close potentially stale client
    if (state.client) {
      try {
        await state.client.close();
      } catch {
        // Ignore close errors during error recovery
      }
      state.client = null;
    }
    
    return null;
  }
}

// Guard to prevent duplicate signal handler registration
let shutdownHandlersRegistered = false;

/**
 * Sets up graceful shutdown handlers for the process
 * Should be called once during application bootstrap
 */
export function setupGracefulShutdown(): void {
  if (shutdownHandlersRegistered) {
    return;
  }
  shutdownHandlersRegistered = true;

  const shutdownHandler = async (signal: string) => {
    console.log(`[Server] ${signal} received, shutting down gracefully...`);
    try {
      await closeConnection();
      console.log('[Server] Cleanup completed');
      process.exit(0);
    } catch (error) {
      console.error('[Server] Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdownHandler('SIGINT'));
  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

  console.log('[Server] Graceful shutdown handlers registered');
}
