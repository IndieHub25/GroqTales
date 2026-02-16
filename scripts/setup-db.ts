import * as dotenv from 'dotenv';
import { config } from 'dotenv';
import { resolve } from 'path';
import initializeDatabase from '../lib/init-db';
import testConnection from '../lib/test-db';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    console.log(
      'Using MongoDB URI:',
      process.env.MONGODB_URI?.replace(/:[^:@]*@/, ':****@')
    );

    // Test connection first
    console.log('\n1. Testing database connection...');
    await testConnection();

    // Initialize database
    console.log('\n2. Initializing database...');
    await initializeDatabase();

    console.log('\nDatabase setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nDatabase setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
