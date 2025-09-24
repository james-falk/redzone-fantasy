#!/usr/bin/env node

/**
 * Database Wipe Utility for Redzone Fantasy
 * 
 * This script completely wipes the content collection in MongoDB.
 * Use with caution - this will delete all ingested content!
 * 
 * Usage:
 *   npm run wipe-db
 *   npx tsx scripts/wipe-db.ts
 */

import { config } from 'dotenv';
import { database } from '../src/lib/database.js';
import { logger } from '../src/lib/logger.js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Fallback: Set MongoDB URI directly if not loaded from env file
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  console.error('💡 Make sure you have a .env.local file with MONGODB_URI set');
  process.exit(1);
}

async function wipeDatabase() {
  try {
    console.log('🗑️  Starting database wipe...');
    console.log('⚠️  This will delete ALL content from the database!');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to MongoDB');

    // Get the collection
    const db = database.getDb();
    const collection = db.collection('content');

    // Count existing documents
    const existingCount = await collection.countDocuments();
    console.log(`📊 Found ${existingCount} existing documents`);

    if (existingCount === 0) {
      console.log('✅ Database is already empty');
      return;
    }

    // Delete all documents
    const result = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} documents`);

    // Verify deletion
    const remainingCount = await collection.countDocuments();
    if (remainingCount === 0) {
      console.log('✅ Database wipe completed successfully');
      logger.info('Database wiped successfully', {
        deletedCount: result.deletedCount,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error(`❌ Wipe incomplete - ${remainingCount} documents remain`);
    }

  } catch (error) {
    console.error('❌ Database wipe failed:', (error as Error).message);
    logger.error('Database wipe failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  } finally {
    // Close database connection
    await database.close();
    console.log('🔌 Database connection closed');
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will delete ALL content from the database!');
console.log('📝 Make sure you have MONGODB_URI set in your .env.local file');
console.log('🚀 Starting in 3 seconds... Press Ctrl+C to cancel');

setTimeout(() => {
  wipeDatabase().catch(console.error);
}, 3000);
