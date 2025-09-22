#!/usr/bin/env node

/**
 * Content Ingestion Script for Redzone Fantasy
 * 
 * This script can be run manually or scheduled to ingest content from all configured sources.
 * 
 * Usage:
 *   npm run ingest              # Ingest from all sources
 *   node scripts/ingest.js      # Same as above
 *   node scripts/ingest.js --source=source-id  # Ingest from specific source
 */

const { register } = require('ts-node');

// Register TypeScript compiler with ESM support
register({
  project: './tsconfig.json',
  transpileOnly: true,
  esm: true,
});

// Use dynamic imports for ESM modules
let ingestionOrchestrator, logger;

async function main() {
  const args = process.argv.slice(2);
  const sourceArg = args.find(arg => arg.startsWith('--source='));
  const specificSource = sourceArg ? sourceArg.split('=')[1] : null;

  try {
    // Dynamic imports for TypeScript modules
    const { ingestionOrchestrator: orchestrator } = await import('../modules/ingestion-orchestrator.ts');
    const { logger: log } = await import('../lib/logger.ts');
    
    ingestionOrchestrator = orchestrator;
    logger = log;
    
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
    logger.error('Ingestion script failed', { error: error.message });
    console.error('❌ Ingestion failed:', error.message);
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
