const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/groqtales';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    const db = mongoose.connection.db;

    // Insert demo user
    await db.collection('users').updateOne(
      { email: 'demo@groqtales.com' },
      {
        $set: {
          email: 'demo@groqtales.com',
          username: 'demo_user',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Insert demo story
    await db.collection('stories').updateOne(
      { title: 'Demo Story' },
      {
        $set: {
          title: 'Demo Story',
          description: 'This is a seeded demo story.',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Insert demo NFT
    await db.collection('nfts').updateOne(
      { tokenId: 1 },
      {
        $set: {
          tokenId: 1,
          name: 'Demo NFT',
          owner: 'demo_user',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('Seed data inserted successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
