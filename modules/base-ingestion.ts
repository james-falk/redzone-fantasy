import { ContentCard, SourceConfig, IngestionResult, IngestionError } from '../src/lib/types';
import { logger, logIngestionStart, logIngestionComplete, logIngestionError } from '../src/lib/logger';
import { database } from '../src/lib/database';

export abstract class BaseIngestionModule {
  protected sourceConfig: SourceConfig;

  constructor(sourceConfig: SourceConfig) {
    this.sourceConfig = sourceConfig;
  }

  /**
   * Abstract method that each ingestion module must implement
   * This method should fetch data from the source and return ContentCard objects
   */
  protected abstract fetchData(): Promise<ContentCard[]>;

  /**
   * Main ingestion method that handles the full process
   */
  async ingest(): Promise<IngestionResult> {
    const startTime = Date.now();
    logIngestionStart(this.sourceConfig.id, this.sourceConfig.name);

    try {
      // Validate source configuration
      this.validateConfig();

      // Fetch data from the source
      const contentItems = await this.fetchData();

      // Validate and clean the data
      const validatedItems = this.validateItems(contentItems);

      // Save to database
      let savedCount = 0;
      if (validatedItems.length > 0) {
        savedCount = await database.saveContent(validatedItems);
      }

      const result: IngestionResult = {
        sourceId: this.sourceConfig.id,
        success: true,
        itemsProcessed: contentItems.length,
        itemsSaved: savedCount,
        errors: [],
        timestamp: new Date(),
      };

      logIngestionComplete(
        this.sourceConfig.id,
        this.sourceConfig.name,
        result.itemsProcessed,
        result.itemsSaved
      );

      const duration = Date.now() - startTime;
      logger.info(`Ingestion completed in ${duration}ms`, {
        sourceId: this.sourceConfig.id,
        duration,
      });

      return result;
    } catch (error) {
      logIngestionError(this.sourceConfig.id, this.sourceConfig.name, error as Error);

      return {
        sourceId: this.sourceConfig.id,
        success: false,
        itemsProcessed: 0,
        itemsSaved: 0,
        errors: [(error as Error).message],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate the source configuration
   */
  protected validateConfig(): void {
    if (!this.sourceConfig.enabled) {
      throw new IngestionError(
        'Source is disabled',
        this.sourceConfig.id
      );
    }
  }

  /**
   * Validate and clean content items
   */
  protected validateItems(items: ContentCard[]): ContentCard[] {
    const validItems: ContentCard[] = [];
    const errors: string[] = [];

    for (const item of items) {
      try {
        // Basic validation
        if (!item.id || !item.title || !item.url) {
          throw new Error('Missing required fields: id, title, or url');
        }

        // Ensure publishedAt is a valid ISO string
        if (item.publishedAt && !this.isValidISODate(item.publishedAt)) {
          throw new Error('Invalid publishedAt date format');
        }

        // Set default values
        const validatedItem: ContentCard = {
          ...item,
          sourceName: this.sourceConfig.name,
          type: this.sourceConfig.type as any,
          publishedAt: item.publishedAt || new Date().toISOString(),
        };

        validItems.push(validatedItem);
      } catch (error) {
        errors.push(`Item validation failed: ${(error as Error).message}`);
        logger.warn('Item validation failed', {
          sourceId: this.sourceConfig.id,
          item,
          error: (error as Error).message,
        });
      }
    }

    if (errors.length > 0) {
      logger.warn(`${errors.length} items failed validation`, {
        sourceId: this.sourceConfig.id,
        errors,
      });
    }

    return validItems;
  }

  /**
   * Helper method to validate ISO date strings
   */
  protected isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString();
  }

  /**
   * Helper method to generate a unique ID for content items
   */
  protected generateId(url: string, publishedAt?: string): string {
    const baseId = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = publishedAt ? new Date(publishedAt).getTime() : Date.now();
    return `${this.sourceConfig.id}-${baseId}-${timestamp}`;
  }

  /**
   * Helper method to clean and truncate text
   */
  protected cleanText(text: string, maxLength?: number): string {
    if (!text) return '';
    
    // Remove HTML tags and decode entities
    let cleaned = text
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();

    // Truncate if needed
    if (maxLength && cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength - 3) + '...';
    }

    return cleaned;
  }

  /**
   * Helper method to extract domain from URL
   */
  protected extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }
}
