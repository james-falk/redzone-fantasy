import { z } from 'zod';

// Content types enum
export const ContentType = {
  ARTICLE: 'article',
  VIDEO: 'video',
  PODCAST: 'podcast',
} as const;

export type ContentTypeEnum = typeof ContentType[keyof typeof ContentType];

// Enhanced unified content schema with comprehensive metadata
export const ContentCardSchema = z.object({
  // Core fields
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  sourceName: z.string(),
  type: z.enum(['article', 'video', 'podcast']),
  publishedAt: z.string().datetime(),
  url: z.string().url(),
  
  // Enhanced metadata fields
  author: z.string().optional(), // Author/creator name
  duration: z.number().optional(), // Video/podcast duration in seconds
  viewCount: z.number().optional(), // YouTube view count
  likeCount: z.number().optional(), // YouTube likes
  commentCount: z.number().optional(), // YouTube comments
  
  // Fantasy football specific tags
  tags: z.array(z.string()).optional(), // Auto-extracted tags
  players: z.array(z.string()).optional(), // Player names mentioned
  teams: z.array(z.string()).optional(), // NFL teams mentioned
  positions: z.array(z.string()).optional(), // QB, RB, WR, TE, K, DEF
  leagueTypes: z.array(z.string()).optional(), // dynasty, redraft, superflex, ppr, standard
  contentCategories: z.array(z.string()).optional(), // rankings, waiver, trade, injury, news
  
  // Source-specific metadata
  sourceMetadata: z.record(z.any()).optional(), // Flexible object for source-specific data
  
  // RSS-specific fields
  guid: z.string().optional(), // RSS GUID for deduplication
  categories: z.array(z.string()).optional(), // RSS categories
  
  // YouTube-specific fields
  videoId: z.string().optional(), // YouTube video ID
  channelId: z.string().optional(), // YouTube channel ID
  channelTitle: z.string().optional(), // YouTube channel name
  
  // Podcast-specific fields
  episodeNumber: z.number().optional(), // Podcast episode number
  seasonNumber: z.number().optional(), // Podcast season number
  audioUrl: z.string().url().optional(), // Direct audio file URL
  
  // Content analysis
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(), // Sentiment analysis
  readingTime: z.number().optional(), // Estimated reading time in minutes
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(), // Content difficulty
  
  // Internal tracking
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  ingestionSource: z.string().optional(),
  ingestionVersion: z.string().optional(), // Track ingestion module version
  lastAnalyzed: z.date().optional(), // When content was last analyzed for tags
});

// TypeScript type derived from schema
export type ContentCard = z.infer<typeof ContentCardSchema>;

// Database document type (includes MongoDB _id)
export interface ContentDocument extends ContentCard {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced filter types for the frontend
export interface ContentFilters {
  type?: ContentTypeEnum;
  sourceName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
  
  // Enhanced filtering options
  author?: string;
  tags?: string[];
  players?: string[];
  teams?: string[];
  positions?: string[];
  leagueTypes?: string[];
  contentCategories?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  minDuration?: number; // Minimum duration in seconds
  maxDuration?: number; // Maximum duration in seconds
}

// API response types
export interface ContentResponse {
  content: ContentCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ContentFilters;
}

// Source configuration types
export interface SourceConfig {
  id: string;
  name: string;
  type: ContentTypeEnum;
  enabled: boolean;
  url: string;
  updateInterval: number; // Update interval in minutes
  channelId?: string; // YouTube channel ID (for YouTube sources)
  config?: Record<string, unknown>; // Flexible config for different source types
}

// Ingestion result types
export interface IngestionResult {
  sourceId: string;
  success: boolean;
  itemsProcessed: number;
  itemsSaved: number;
  errors: string[];
  timestamp: Date;
}

// Error types
export class IngestionError extends Error {
  constructor(
    message: string,
    public sourceId: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'IngestionError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public data: unknown,
    public validationErrors: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
