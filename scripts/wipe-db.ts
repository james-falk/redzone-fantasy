#!/usr/bin/env npx tsx

import dotenv from 'dotenv';
import { database } from '../src/lib/database';
import { logger } from '../src/lib/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function wipeDatabase() {
  try {
    logger.info('Starting database wipe process');
    
    // Connect to database
    await database.connect();
    logger.info('Connected to MongoDB');
    
    // Get the database instance
    const db = database.getDb();
    
    // Drop the content collection
    try {
      await db.collection('content').drop();
      logger.info('Content collection dropped successfully');
    } catch (error: any) {
      if (error.code === 26) {
        // Collection doesn't exist, that's fine
        logger.info('Content collection does not exist, nothing to drop');
      } else {
        throw error;
      }
    }
    
    // Recreate indexes
    await database.createIndexes();
    logger.info('Database indexes recreated');
    
    logger.info('Database wipe completed successfully');
    
  } catch (error) {
    logger.error('Database wipe failed:', error);
    throw error;
  } finally {
    await database.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the wipe if this script is executed directly
if (require.main === module) {
  wipeDatabase()
    .then(() => {
      console.log('✅ Database wiped successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database wipe failed:', error);
      process.exit(1);
    });
}

export { wipeDatabase };
