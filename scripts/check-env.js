#!/usr/bin/env node

/**
 * Environment Variables Check Script
 *
 * This script verifies that all required environment variables are
 * properly set before running the application.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// In production environments like Vercel, env vars are set in the platform
const isProduction = process.env.NODE_ENV === 'production';

// Load environment variables from .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

// Required environment variables
const requiredVars = ['NEXT_PUBLIC_GROQ_API_KEY'];

// Optional environment variables (only checked in development)
const developmentVars = ['MONGODB_URI', 'MONGODB_DB_NAME'];

// Optional but recommended environment variables
const recommendedVars = [
  'NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID',
  'NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET',
  'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID',
];

// In production, we assume env vars are set correctly in the platform
if (isProduction && !fs.existsSync(envLocalPath)) {
  console.log('\n🔍 Environment Variables Check - Production Mode\n');
  console.log(
    'Using environment variables configured in the hosting platform.\n'
  );

  // Just check that required vars exist
  const missingVars = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Check development vars but don't fail build for them
  const missingDevVars = [];
  for (const varName of developmentVars) {
    if (!process.env[varName]) {
      missingDevVars.push(varName);
    }
  }

  if (missingVars.length === 0) {
    console.log(
      '\x1b[32m%s\x1b[0m',
      '✅ All required environment variables are set!\n'
    );

    if (missingDevVars.length > 0) {
      console.log(
        '\x1b[33m%s\x1b[0m',
        'ℹ️ Missing development environment variables (using defaults):'
      );
      missingDevVars.forEach((varName) => {
        console.log(`   - ${varName}`);
      });
      console.log();
    }
  } else {
    console.error(
      '\x1b[31m%s\x1b[0m',
      '❌ Missing required environment variables:'
    );
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.log(
      '\n\x1b[33m%s\x1b[0m',
      'Please configure these variables in your hosting platform.'
    );
    process.exit(1);
  }

  console.log('\n✨ Environment check completed successfully!\n');
  process.exit(0);
}

// For development environment, check for .env.local
if (!isProduction && !fs.existsSync(envLocalPath)) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: .env.local file not found!');
  console.log(
    '\x1b[33m%s\x1b[0m',
    'Please copy .env.example to .env.local and fill in your environment variables.'
  );
  process.exit(1);
}

// Check required variables
const missingVars = [];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

// Check development variables
const missingDevVars = [];
for (const varName of developmentVars) {
  if (!process.env[varName]) {
    missingDevVars.push(varName);
  }
}

// Output results
console.log('\n🔍 Environment Variables Check\n');

if (missingVars.length === 0) {
  console.log(
    '\x1b[32m%s\x1b[0m',
    '✅ All required environment variables are set!\n'
  );

  if (missingDevVars.length > 0) {
    console.log(
      '\x1b[33m%s\x1b[0m',
      'ℹ️ Missing development environment variables (using defaults):'
    );
    missingDevVars.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log();
  }
} else {
  console.error(
    '\x1b[31m%s\x1b[0m',
    '❌ Missing required environment variables:'
  );
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.log(
    '\n\x1b[33m%s\x1b[0m',
    'Please update your .env.local file with these variables.'
  );
  process.exit(1);
}

// Check recommended variables
const missingRecommended = [];
for (const varName of recommendedVars) {
  if (!process.env[varName]) {
    missingRecommended.push(varName);
  }
}

if (missingRecommended.length > 0) {
  console.log(
    '\x1b[33m%s\x1b[0m',
    '⚠️ Missing recommended environment variables:'
  );
  missingRecommended.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
  console.log(
    '\nThese variables are not required but recommended for full functionality.'
  );
}

console.log('\n✨ Environment check completed successfully!\n');
