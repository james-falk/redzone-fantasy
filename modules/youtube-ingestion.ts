import { ContentCard, IngestionError } from '../src/lib/types';
import { BaseIngestionModule } from './base-ingestion';
import { logger } from '../src/lib/logger';

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
      standard?: { url: string };
      maxres?: { url: string };
    };
  };
}

interface YouTubeResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export class YouTubeIngestionModule extends BaseIngestionModule {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(sourceConfig: any) {
    super(sourceConfig);
    
    if (!process.env.YOUTUBE_API_KEY) {
      throw new IngestionError(
        'YOUTUBE_API_KEY environment variable is required',
        this.sourceConfig.id
      );
    }
    
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  protected validateConfig(): void {
    super.validateConfig();
    
    if (!this.sourceConfig.config.channelId) {
      throw new IngestionError(
        'Channel ID is required in source configuration',
        this.sourceConfig.id
      );
    }
  }

  protected async fetchData(): Promise<ContentCard[]> {
    try {
      const channelId = this.sourceConfig.config.channelId as string;
      if (!channelId || typeof channelId !== 'string') {
        throw new Error('Channel ID is required and must be a string');
      }
      
      const maxResults = (this.sourceConfig.config.maxResults as number) || 10;
      
      logger.info(`Fetching YouTube videos for channel: ${channelId}`, { 
        sourceId: this.sourceConfig.id,
        maxResults,
      });

      const videos = await this.fetchChannelVideos(channelId, maxResults);
      
      if (videos.length === 0) {
        logger.warn(`No videos found for channel: ${channelId}`, { 
          sourceId: this.sourceConfig.id 
        });
        return [];
      }

      logger.info(`Found ${videos.length} videos for channel`, { 
        sourceId: this.sourceConfig.id,
        channelId,
      });

      const contentItems = videos.map(video => {
        return this.transformYouTubeVideo(video);
      }).filter((item): item is ContentCard => item !== null);

      return contentItems;
    } catch (error) {
      throw new IngestionError(
        `Failed to fetch YouTube videos: ${(error as Error).message}`,
        this.sourceConfig.id,
        error as Error
      );
    }
  }

  private async fetchChannelVideos(channelId: string, maxResults: number): Promise<YouTubeVideo[]> {
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('channelId', channelId);
    url.searchParams.append('part', 'id,snippet');
    url.searchParams.append('type', 'video');
    url.searchParams.append('order', 'date');
    url.searchParams.append('maxResults', maxResults.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API error (${response.status}): ${errorText}`);
    }

    const data: YouTubeResponse = await response.json();
    
    if (!data.items) {
      throw new Error('Invalid response from YouTube API');
    }

    return data.items;
  }

  private transformYouTubeVideo(video: YouTubeVideo): ContentCard | null {
    try {
      if (!video.id?.videoId || !video.snippet?.title) {
        logger.warn('YouTube video missing required fields', {
          sourceId: this.sourceConfig.id,
          video: { id: video.id, title: video.snippet?.title },
        });
        return null;
      }

      const videoId = video.id.videoId;
      const snippet = video.snippet;

      // Get the best available thumbnail
      const thumbnails = snippet.thumbnails;
      let thumbnailUrl: string | undefined;
      
      if (thumbnails.maxres?.url) {
        thumbnailUrl = thumbnails.maxres.url;
      } else if (thumbnails.standard?.url) {
        thumbnailUrl = thumbnails.standard.url;
      } else if (thumbnails.high?.url) {
        thumbnailUrl = thumbnails.high.url;
      } else if (thumbnails.medium?.url) {
        thumbnailUrl = thumbnails.medium.url;
      } else if (thumbnails.default?.url) {
        thumbnailUrl = thumbnails.default.url;
      }

      // Create video URL
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Generate unique ID
      const id = this.generateId(videoUrl, snippet.publishedAt);

      // Clean description
      const description = snippet.description 
        ? this.cleanText(snippet.description, 500)
        : undefined;

      // Ensure publishedAt is in proper ISO format
      let publishedAt: string;
      try {
        publishedAt = new Date(snippet.publishedAt).toISOString();
      } catch {
        publishedAt = new Date().toISOString(); // Fallback to current time
        logger.warn('Invalid publishedAt date, using current time', {
          sourceId: this.sourceConfig.id,
          originalDate: snippet.publishedAt,
        });
      }

      const contentCard: ContentCard = {
        id,
        title: this.cleanText(snippet.title, 200),
        description,
        thumbnailUrl,
        sourceName: this.sourceConfig.name,
        type: 'video',
        publishedAt,
        url: videoUrl,
        ingestionSource: this.sourceConfig.id,
      };

      return contentCard;
    } catch (error) {
      logger.warn('Failed to transform YouTube video', {
        sourceId: this.sourceConfig.id,
        error: (error as Error).message,
        video,
      });
      return null;
    }
  }
}
