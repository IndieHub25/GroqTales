import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import { connectWithRetry, setupGracefulShutdown } from './db/connect';

// Only load dotenv in non-production local dev (avoid interfering with hosting platform env injection)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

const shouldMockDb =
  process.env.MONGO_MOCK === 'true' ||
  process.env.NEXT_PUBLIC_BUILD_MODE === 'true' ||
  process.env.CI === 'true' ||
  process.env.VERCEL === '1' ||
  (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI);

const forceMock = process.env.MONGO_MOCK === 'true';

// Types for mock implementation
type MockCollection = {
  findOne: () => Promise<null>;
  find: () => { toArray: () => Promise<any[]> };
  insertOne: () => Promise<{ insertedId: string }>;
  updateOne: () => Promise<{ modifiedCount: number }>;
  deleteOne: () => Promise<{ deletedCount: number }>;
  createIndex: () => Promise<void>;
  drop: () => Promise<void>;
};

type MockDb = {
  collection: (_name?: string) => MockCollection;
  createCollection: (_name?: string) => Promise<void>;
};

type MockClient = {
  db: (_dbName?: string) => MockDb;
};

let clientPromise: Promise<MongoClient | MockClient>;

function createMockClient(): MockClient {
  return {
    db: () => ({
      collection: () => ({
        findOne: async () => null,
        find: () => ({ toArray: async () => [] }),
        insertOne: async () => ({ insertedId: 'mock-id' }),
        updateOne: async () => ({ modifiedCount: 1 }),
        deleteOne: async () => ({ deletedCount: 1 }),
        createIndex: async () => {},
        drop: async () => {},
      }),
      createCollection: async () => {},
    }),
  };
}

if (shouldMockDb || forceMock) {
  // Use mock during build / forced mock to avoid DNS SRV lookups that fail in export
  clientPromise = Promise.resolve(createMockClient());
} else {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local');
  }
  const uri = process.env.MONGODB_URI;

  // If SRV lookup has historically failed and a fallback non-SRV URI is provided, prefer it.
  const fallbackUri = process.env.MONGODB_FALLBACK_URI; // e.g., mongodb://username:password@host:27017/dbname?replicaSet=...
  const finalUri =
    uri.startsWith('mongodb+srv://') && fallbackUri ? fallbackUri : uri;

  // Use retry logic if enabled (Issue #166)
  const useRetryLogic = process.env.DB_USE_RETRY !== 'false'; // default true

  let client: MongoClient;

  if (useRetryLogic) {
    // Use new retry connection logic with exponential backoff
    const maxRetries = parseInt(process.env.DB_MAX_RETRIES || '5');
    const retryDelayMs = parseInt(process.env.DB_RETRY_DELAY_MS || '2000');

    clientPromise = connectWithRetry({
      uri: finalUri,
      maxRetries,
      retryDelayMs,
      dbName: process.env.MONGODB_DB_NAME,
    });

    // Setup graceful shutdown handlers once
    if (typeof window === 'undefined') {
      setupGracefulShutdown();
    }
  } else {
    // Legacy connection logic (no retry)
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    } as any;

    if (process.env.NODE_ENV === 'development') {
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };
      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(finalUri, options);
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      client = new MongoClient(finalUri, options);
      clientPromise = client.connect();
    }
  }
}

export default clientPromise;
export { clientPromise };
