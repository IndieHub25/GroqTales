import { getDb } from './db';

async function initializeDatabase() {
  try {
    const db = await getDb();

    // Create collections
    await db.createCollection('users');
    await db.createCollection('stories');
    await db.createCollection('comments');
    await db.createCollection('genres');
    await db.createCollection('nfts');

    // Create indexes
    const users = db.collection('users');
    await users.createIndex({ address: 1 }, { unique: true });
    await users.createIndex({ username: 1 }, { sparse: true });

    const stories = db.collection('stories');
    await stories.createIndex({ author: 1 });
    await stories.createIndex({ genre: 1 });
    await stories.createIndex({ tokenId: 1 }, { sparse: true });
    await stories.createIndex({ isPublished: 1 });

    const comments = db.collection('comments');
    await comments.createIndex({ storyId: 1 });
    await comments.createIndex({ author: 1 });

    const genres = db.collection('genres');
    await genres.createIndex({ slug: 1 }, { unique: true });

    const nfts = db.collection('nfts');
    await nfts.createIndex({ storyId: 1 });
    await nfts.createIndex({ tokenId: 1 }, { unique: true });
    await nfts.createIndex({ owner: 1 });

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
// Only run initialization in development
if (process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(console.error);
}
export default initializeDatabase;
