import mongoose from 'mongoose';

// Check if we should use a mock DB (enabled via build-only env var)
const shouldMockDb =
  process.env.MONGO_MOCK === 'true' ||
  process.env.MONGO_MOCK_BUILD === '1' ||
  process.env.MONGO_MOCK_BUILD === 'true' ||
  process.env.BUILD_MODE === 'true' ||
  process.env.NEXT_PUBLIC_BUILD_MODE === 'true' ||
  process.env.CI === 'true';

const MONGODB_URI = process.env.MONGODB_URI;

// Only throw error if we're not in mock mode
if (!MONGODB_URI && !shouldMockDb) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Interface for the cached connection
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  // Use mock in build/CI mode to avoid needing MongoDB connection
  if (shouldMockDb) {
    if (cached!.conn) {
      return cached!.conn;
    }
    if (!cached!.promise) {
      // Return a minimal mock connection
      cached!.promise = Promise.resolve(mongoose);
    }
    cached!.conn = await cached!.promise;
    return cached!.conn;
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected Successfully');
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
