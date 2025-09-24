import Parser from 'rss-parser';
import { ContentCard, IngestionError } from '../src/lib/types';
import { BaseIngestionModule } from './base-ingestion';
import { logger } from '../src/lib/logger';

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  guid?: string;
  content?: string;
  contentSnippet?: string;
  enclosure?: {
    url: string;
    type: string;
  };
  [key: string]: any;
}

export class RSSIngestionModule extends BaseIngestionModule {
  private parser: Parser<any, RSSItem>;

  constructor(sourceConfig: any) {
    super(sourceConfig);
    this.parser = new Parser({
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Redzone Fantasy Content Aggregator 1.0',
      },
    });
  }

  protected validateConfig(): void {
    super.validateConfig();
    
    if (!this.sourceConfig.url) {
      throw new IngestionError(
        'RSS URL is required in source configuration',
        this.sourceConfig.id
      );
    }
  }

  protected async fetchData(): Promise<ContentCard[]> {
    try {
      const rssUrl = this.sourceConfig.url;
      if (!rssUrl || typeof rssUrl !== 'string') {
        throw new Error('RSS URL is required and must be a string');
      }
      
      logger.info(`Fetching RSS feed: ${rssUrl}`, { sourceId: this.sourceConfig.id });

      const feed = await this.parser.parseURL(rssUrl);
      
      if (!feed.items || feed.items.length === 0) {
        logger.warn(`No items found in RSS feed: ${rssUrl}`, { sourceId: this.sourceConfig.id });
        return [];
      }

      logger.info(`Found ${feed.items.length} items in RSS feed`, { 
        sourceId: this.sourceConfig.id,
        feedTitle: feed.title,
      });

      const contentItems: ContentCard[] = feed.items.map((item: RSSItem) => {
        return this.transformRSSItem(item, feed);
      });

      return contentItems.filter(item => item !== null) as ContentCard[];
    } catch (error) {
      throw new IngestionError(
        `Failed to fetch RSS feed: ${(error as Error).message}`,
        this.sourceConfig.id,
        error as Error
      );
    }
  }

  private transformRSSItem(item: RSSItem, feed: any): ContentCard | null {
    try {
      // Ensure we have required fields
      if (!item.link || !item.title) {
        logger.warn('RSS item missing required fields', {
          sourceId: this.sourceConfig.id,
          item: { title: item.title, link: item.link },
        });
        return null;
      }

      // Extract description
      let description = item.description || item.contentSnippet || item.content;
      if (description) {
        description = this.cleanText(description, 500);
      }

      // Extract thumbnail
      let thumbnailUrl: string | undefined;
      
      // Try to get thumbnail from enclosure
      if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        thumbnailUrl = item.enclosure.url;
      }

      // Try to extract image from content
      if (!thumbnailUrl && description) {
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
        if (imgMatch) {
          thumbnailUrl = imgMatch[1];
        }
      }

      // Generate unique ID
      const id = this.generateId(item.link, item.pubDate);

      // Parse published date
      let publishedAt = new Date().toISOString();
      if (item.pubDate) {
        try {
          publishedAt = new Date(item.pubDate).toISOString();
        } catch {
          logger.warn('Invalid date format in RSS item', {
            sourceId: this.sourceConfig.id,
            pubDate: item.pubDate,
          });
        }
      }

      // Extract author information
      let author: string | undefined;
      if (item.creator) {
        author = this.cleanText(item.creator, 100);
      } else if (item.author) {
        author = this.cleanText(item.author, 100);
      } else if ((item as any)['dc:creator']) {
        author = this.cleanText((item as any)['dc:creator'], 100);
      }

      const contentCard: ContentCard = {
        id,
        title: this.cleanText(item.title, 200),
        description,
        thumbnailUrl,
        sourceName: this.sourceConfig.name,
        type: this.sourceConfig.type as any,
        publishedAt,
        url: item.link,
        author,
        ingestionSource: this.sourceConfig.id,
      };

      return contentCard;
    } catch (error) {
      logger.warn('Failed to transform RSS item', {
        sourceId: this.sourceConfig.id,
        error: (error as Error).message,
        item,
      });
      return null;
    }
  }
}
