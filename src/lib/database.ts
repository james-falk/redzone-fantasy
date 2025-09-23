import { MongoClient, Db, Collection } from 'mongodb';
import { ContentDocument, ContentCard, ContentFilters } from './types';
import { logger } from './logger';

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    // Don't throw error on initialization - allow graceful degradation
    // Environment variables might not be loaded yet in API routes
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client && this.db) {
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required for database operations');
    }

    try {
      this.client = new MongoClient(process.env.MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB_NAME || 'redzone_fantasy');
      this.isConnected = true;
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getContentCollection(): Collection<ContentDocument> {
    return this.getDb().collection<ContentDocument>('content');
  }

  async saveContent(content: ContentCard[]): Promise<number> {
    try {
      const collection = this.getContentCollection();
      const now = new Date();
      
      const documentsToSave: ContentDocument[] = content.map(item => ({
        ...item,
        createdAt: now,
        updatedAt: now,
      }));

      // Use upsert to avoid duplicates based on url
      const operations = documentsToSave.map(doc => {
        const { createdAt, ...docWithoutCreatedAt } = doc;
        return {
          updateOne: {
            filter: { url: doc.url },
            update: { 
              $set: { ...docWithoutCreatedAt, updatedAt: now },
              $setOnInsert: { createdAt: now }
            },
            upsert: true,
          },
        };
      });

      const result = await collection.bulkWrite(operations);
      const savedCount = result.upsertedCount + result.modifiedCount;
      
      logger.info(`Saved ${savedCount} content items to database`);
      return savedCount;
    } catch (error) {
      logger.error('Error saving content to database:', error);
      throw error;
    }
  }

  async getContent(
    filters: ContentFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ content: ContentDocument[]; total: number }> {
    try {
      const collection = this.getContentCollection();
      const query: Record<string, unknown> = {};

      // Apply filters
      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.sourceName) {
        query.sourceName = filters.sourceName;
      }

      if (filters.dateRange) {
        query.publishedAt = {
          $gte: filters.dateRange.start.toISOString(),
          $lte: filters.dateRange.end.toISOString(),
        };
      }

      if (filters.searchQuery) {
        query.$text = { $search: filters.searchQuery };
      }

      const skip = (page - 1) * limit;
      
      const [content, total] = await Promise.all([
        collection
          .find(query)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(query),
      ]);

      return { content, total };
    } catch (error) {
      logger.error('Error fetching content from database:', error);
      throw error;
    }
  }

  async getSourceNames(): Promise<string[]> {
    try {
      const collection = this.getContentCollection();
      const sources = await collection.distinct('sourceName');
      return sources.sort();
    } catch (error) {
      logger.error('Error fetching source names:', error);
      throw error;
    }
  }

  async createIndexes(): Promise<void> {
    try {
      const collection = this.getContentCollection();
      
      // Create indexes for better query performance
      await Promise.all([
        collection.createIndex({ url: 1 }, { unique: true }),
        collection.createIndex({ type: 1 }),
        collection.createIndex({ sourceName: 1 }),
        collection.createIndex({ publishedAt: -1 }),
        collection.createIndex({ title: 'text', description: 'text' }),
      ]);

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes:', error);
      throw error;
    }
  }
}

// Singleton instance
export const database = new DatabaseManager();

// Helper function to ensure connection
export async function withDatabase<T>(
  operation: (db: Db) => Promise<T>
): Promise<T> {
  await database.connect();
  return operation(database.getDb());
}
