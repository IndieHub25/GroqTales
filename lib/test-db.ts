import { getDb, insertOne, findOne } from './db';

async function testConnection() {
  try {
    // Test database connection
    const db = await getDb();
    console.log('Successfully connected to MongoDB');

    // Test basic operations
    const testCollection = 'test';
    const testDocument = {
      name: 'Test Document',
      timestamp: new Date(),
    };

    // Insert test document
    const insertResult = await insertOne(testCollection, testDocument);
    console.log('Test document inserted:', insertResult.insertedId);

    // Retrieve test document
    const foundDocument = await findOne(testCollection, {
      _id: insertResult.insertedId,
    });
    console.log('Retrieved test document:', foundDocument);

    // Clean up
    await db.collection(testCollection).drop();
    console.log('Test collection cleaned up');

    console.log('All database tests passed successfully');
  } catch (error) {
    console.error('Database test failed:', error);
    throw error;
  }
}
// Run the test if this file is executed directly
if (require.main === module) {
  testConnection().catch(console.error);
}
export default testConnection;
