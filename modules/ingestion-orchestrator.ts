import { SourceConfig, IngestionResult, ContentCard } from '../src/lib/types';
import { database } from '../src/lib/database';
import { logger } from '../src/lib/logger';
import { getEnabledSources, validateEnvironmentVariables } from '../config/sources';
import { BaseIngestionModule } from './base-ingestion';
import { RSSIngestionModule } from './rss-ingestion';
import { YouTubeIngestionModule } from './youtube-ingestion';

export class IngestionOrchestrator {
  private modules: Map<string, BaseIngestionModule> = new Map();

  constructor() {
    this.initializeModules();
  }

  private initializeModules(): void {
    const enabledSources = getEnabledSources();
    
    for (const source of enabledSources) {
      try {
        const module = this.createModule(source);
        this.modules.set(source.id, module);
        logger.info(`Initialized ingestion module: ${source.name}`, { 
          sourceId: source.id,
          type: source.type,
        });
      } catch (error) {
        logger.error(`Failed to initialize module for source: ${source.name}`, {
          sourceId: source.id,
          error: (error as Error).message,
        });
      }
    }

    logger.info(`Initialized ${this.modules.size} ingestion modules`);
  }

  private createModule(source: SourceConfig): BaseIngestionModule {
    switch (source.type) {
      case 'article':
      case 'podcast':
        // Both articles and podcasts typically use RSS feeds
        return new RSSIngestionModule(source);
      
      case 'video':
        // Videos use YouTube API
        return new YouTubeIngestionModule(source);
      
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  /**
   * Run ingestion for all enabled sources
   */
  async ingestAll(): Promise<IngestionResult[]> {
    logger.info('Starting full ingestion process');
    
    // Validate environment variables
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.valid) {
      throw new Error(`Missing required environment variables: ${envValidation.missing.join(', ')}`);
    }

    // Connect to database
    await database.connect();
    
    // Ensure database indexes exist
    await database.createIndexes();

    const results: IngestionResult[] = [];
    const allContent: ContentCard[] = [];

    // Process each module
    for (const [sourceId, module] of this.modules) {
      try {
        logger.info(`Starting ingestion for source: ${sourceId}`);
        
        const result = await module.ingest();
        results.push(result);

        if (result.success && result.itemsSaved > 0) {
          // Note: In a real implementation, you'd get the actual content from the module
          // For now, we'll let each module handle its own database saving
          logger.info(`Successfully processed ${result.itemsSaved} items from ${sourceId}`);
        }
      } catch (error) {
        logger.error(`Ingestion failed for source: ${sourceId}`, {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });

        results.push({
          sourceId,
          success: false,
          itemsProcessed: 0,
          itemsSaved: 0,
          errors: [(error as Error).message],
          timestamp: new Date(),
        });
      }
    }

    // Save all content to database
    if (allContent.length > 0) {
      try {
        const savedCount = await database.saveContent(allContent);
        logger.info(`Saved ${savedCount} total items to database`);
      } catch (error) {
        logger.error('Failed to save content to database', {
          error: (error as Error).message,
          contentCount: allContent.length,
        });
      }
    }

    // Log summary
    const successful = results.filter(r => r.success).length;
    const totalProcessed = results.reduce((sum, r) => sum + r.itemsProcessed, 0);
    const totalSaved = results.reduce((sum, r) => sum + r.itemsSaved, 0);

    logger.info('Ingestion process completed', {
      totalSources: results.length,
      successful,
      failed: results.length - successful,
      totalProcessed,
      totalSaved,
    });

    return results;
  }

  /**
   * Run ingestion for a specific source
   */
  async ingestSource(sourceId: string): Promise<IngestionResult> {
    const module = this.modules.get(sourceId);
    if (!module) {
      throw new Error(`No module found for source: ${sourceId}`);
    }

    logger.info(`Starting ingestion for specific source: ${sourceId}`);
    
    // Connect to database
    await database.connect();
    
    const result = await module.ingest();
    
    logger.info(`Ingestion completed for source: ${sourceId}`, {
      success: result.success,
      itemsProcessed: result.itemsProcessed,
      itemsSaved: result.itemsSaved,
    });

    return result;
  }

  /**
   * Get status of all modules
   */
  getModuleStatus(): Array<{ sourceId: string; enabled: boolean; type: string; name: string }> {
    const enabledSources = getEnabledSources();
    
    return enabledSources.map(source => ({
      sourceId: source.id,
      enabled: this.modules.has(source.id),
      type: source.type,
      name: source.name,
    }));
  }

  /**
   * Reload modules (useful for configuration changes)
   */
  reloadModules(): void {
    logger.info('Reloading ingestion modules');
    this.modules.clear();
    this.initializeModules();
  }
}

// Singleton instance
export const ingestionOrchestrator = new IngestionOrchestrator();
