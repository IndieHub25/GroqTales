import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

<<<<<<< HEAD
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

=======
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
<<<<<<< HEAD
=======
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

<<<<<<< HEAD
    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
=======
    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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