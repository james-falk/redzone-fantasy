#!/usr/bin/env node

/**
 * Content Ingestion Script for Redzone Fantasy
 * 
 * This script can be run manually or scheduled to ingest content from all configured sources.
 * 
 * Usage:
 *   npm run ingest              # Ingest from all sources
 *   npx tsx scripts/ingest.ts   # Same as above
 *   npx tsx scripts/ingest.ts --source=source-id  # Ingest from specific source
 */

import { config } from 'dotenv';
import { ingestionOrchestrator } from '../modules/ingestion-orchestrator.js';
import { logger } from '../src/lib/logger.js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Fallback: Set MongoDB URI directly if not loaded from env file
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://redzone_admin:u5fJjGK96wuFwfMH@redzone-fantasy-cluster.556nliv.mongodb.net/?retryWrites=true&w=majority&appName=redzone-fantasy-cluster';
  process.env.MONGODB_DB_NAME = 'redzone_fantasy';
  process.env.LOG_LEVEL = 'info';
}

async function main() {
  const args = process.argv.slice(2);
  const sourceArg = args.find(arg => arg.startsWith('--source='));
  const specificSource = sourceArg ? sourceArg.split('=')[1] : null;

  try {
    logger.info('Starting content ingestion script');
    
    let results;
    
    if (specificSource) {
      logger.info(`Ingesting from specific source: ${specificSource}`);
      results = [await ingestionOrchestrator.ingestSource(specificSource)];
    } else {
      logger.info('Ingesting from all enabled sources');
      results = await ingestionOrchestrator.ingestAll();
    }

    // Print summary
    console.log('\n=== Ingestion Summary ===');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.sourceId}: ${result.itemsSaved}/${result.itemsProcessed} items saved`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
    });

    const totalSaved = results.reduce((sum, r) => sum + r.itemsSaved, 0);
    const totalProcessed = results.reduce((sum, r) => sum + r.itemsProcessed, 0);
    const successful = results.filter(r => r.success).length;
    
    console.log(`\nTotal: ${totalSaved}/${totalProcessed} items saved from ${successful}/${results.length} sources`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Ingestion script failed', { error: (error as Error).message });
    console.error('❌ Ingestion failed:', (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in ingestion script', { error: error.message });
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection in ingestion script', { reason });
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

main();
