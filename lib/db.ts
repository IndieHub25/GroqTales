import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import clientPromise from './mongodb';

/**
 * ---------------------------------------------------------
 * MONGOOSE CONNECTION (For "For You" Feed & Analytics)
 * ---------------------------------------------------------
 * Used by Mongoose Models (UserInteraction, Story, User)
 */
const MONGODB_URI = process.env.MONGODB_URI;
const IS_MOCK_DB =
  process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || process.env.CI === 'true';

if (!MONGODB_URI && !IS_MOCK_DB) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongoose() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Retrieves db data
 */
export async function getDb() {
  // In build mode, return mock database
  if (
    process.env.NEXT_PUBLIC_BUILD_MODE === 'true' ||
    process.env.CI === 'true'
  ) {
    return {
      collection: () => ({
        findOne: () => Promise.resolve(null),
        find: () => ({ toArray: () => Promise.resolve([]) }),
        insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
        updateOne: () => Promise.resolve({ modifiedCount: 1 }),
        deleteOne: () => Promise.resolve({ deletedCount: 1 }),
        createIndex: () => Promise.resolve(),
        drop: () => Promise.resolve(),
      }),
      createCollection: () => Promise.resolve(),
    } as any;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  return db;
}

/**
 * Retrieves collection data
 */
export async function getCollection(collectionName: string) {
  const db = await getDb();
  return db.collection(collectionName);
}

/**
 * Find one document in a collection
 */
export async function findOne(collectionName: string, query: any) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.findOne(query);
  } catch (error) {
    console.error('Error finding document:', error);
    throw error;
  }
}

/**
 * Find multiple documents in a collection
 */
export async function find(
  collectionName: string,
  query: any = {},
  options: any = {}
) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.find(query, options).toArray();
  } catch (error) {
    console.error('Error finding documents:', error);
    throw error;
  }
}

/**
 * Insert one document into a collection
 */
export async function insertOne(collectionName: string, document: any) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.insertOne(document);
  } catch (error) {
    console.error('Error inserting document:', error);
    throw error;
  }
}

/**
 * Update one document in a collection
 */
export async function updateOne(
  collectionName: string,
  query: any,
  update: any
) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.updateOne(query, update);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete one document from a collection
 */
export async function deleteOne(collectionName: string, query: any) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.deleteOne(query);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

/**
 * Creates new objectid
 */
export function createObjectId(id: string) {
  return new ObjectId(id);
}

export { clientPromise };