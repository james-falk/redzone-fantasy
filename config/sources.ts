import { SourceConfig } from '../src/lib/types';

// Configuration for all data sources
// Add, remove, or modify sources here as needed
export const dataSources: SourceConfig[] = [
  // ESPN Fantasy Football Headlines
  {
    id: 'espn-fantasy-football',
    name: 'ESPN Fantasy Football',
    type: 'article',
    enabled: true,
    config: {
      rssUrl: 'https://www.espn.com/espn/rss/nfl/news',
      updateInterval: 30,
    },
  },

  // Single RSS Feed for Testing (Fantasy Football News)
  {
    id: 'fantasysp-rss',
    name: 'FantasySP',
    type: 'article',
    enabled: true,
    config: {
      rssUrl: 'https://www.fantasysp.com/rss/nfl/fantasysp/',
      updateInterval: 30,
    },
  },

  // Single YouTube Channel for Testing (requires YouTube API key)
  {
    id: 'fantasy-footballers-youtube',
    name: 'The Fantasy Footballers',
    type: 'video',
    enabled: true, // Now enabled with YouTube API key
    config: {
      channelId: 'UCDVYQ4Zhbm3S2dlz7P1GBDg', // NFL official channel for testing
      maxResults: 5, // Reduced for testing
      updateInterval: 60,
    },
  },

  // Single Podcast for Testing - using a reliable podcast RSS
  {
    id: 'test-podcast',
    name: 'Test Podcast',
    type: 'podcast',
    enabled: false, // Disable for now, focus on articles first
    config: {
      rssUrl: 'https://feeds.megaphone.fm/test',
      updateInterval: 120, // 2 hours
    },
  },

  // Disabled sources for later testing
  {
    id: 'fantasypros-rss',
    name: 'FantasyPros',
    type: 'article',
    enabled: true, // Enable for testing refresh functionality
    config: {
      rssUrl: 'https://www.fantasypros.com/rss/news.xml',
      updateInterval: 15,
    },
  },
  {
    id: 'nfl-news-rss',
    name: 'NFL.com News',
    type: 'article',
    enabled: false,
    config: {
      rssUrl: 'http://www.nfl.com/rss/rsslanding?searchString=home',
      updateInterval: 30,
    },
  },
  {
    id: 'fantasy-football-today-youtube',
    name: 'Fantasy Football Today',
    type: 'video',
    enabled: true, // Enable for testing refresh functionality
    config: {
      channelId: 'UCF7Uw9I4e_0Kqgj7rBHEJ0A',
      maxResults: 5,
      updateInterval: 60,
    },
  },
  {
    id: 'fantasy-football-today-podcast',
    name: 'Fantasy Football Today Podcast',
    type: 'podcast',
    enabled: false,
    config: {
      rssUrl: 'https://feeds.megaphone.fm/fantasyfootballtoday',
      updateInterval: 120,
    },
  },

  // Additional YouTube channels for testing refresh functionality
  {
    id: 'nfl-official-youtube',
    name: 'NFL Official',
    type: 'video',
    enabled: true,
    config: {
      channelId: 'UCDVYQ4Zhbm3S2dlz7P1GBDg', // NFL Official Channel
      maxResults: 5,
      updateInterval: 60,
    },
  },
  {
    id: 'fantasy-pros-youtube',
    name: 'FantasyPros YouTube',
    type: 'video',
    enabled: true,
    config: {
      channelId: 'UCF_7YKYJMtqmP_juM1bJ8qQ', // FantasyPros YouTube Channel
      maxResults: 5,
      updateInterval: 60,
    },
  },
  {
    id: 'dynasty-domain-youtube',
    name: 'Dynasty Domain',
    type: 'video',
    enabled: true,
    config: {
      channelId: 'UCy6AzBHW2_w3lyA_AqUTTmg', // Dynasty Domain YouTube Channel
      maxResults: 5,
      updateInterval: 60,
    },
  },
];

// Helper functions for source management
export const getEnabledSources = (): SourceConfig[] => {
  return dataSources.filter(source => source.enabled);
};

export const getSourcesByType = (type: string): SourceConfig[] => {
  return dataSources.filter(source => source.type === type && source.enabled);
};

export const getSourceById = (id: string): SourceConfig | undefined => {
  return dataSources.find(source => source.id === id);
};

// Environment variable validation
export const validateEnvironmentVariables = (): { valid: boolean; missing: string[] } => {
  const required = ['MONGODB_URI'];
  const optional = ['YOUTUBE_API_KEY', 'MONGODB_DB_NAME', 'LOG_LEVEL'];
  const missing: string[] = [];

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check if YouTube sources are enabled but API key is missing
  const youtubeSourcesEnabled = dataSources.some(
    source => source.type === 'video' && source.enabled
  );
  
  if (youtubeSourcesEnabled && !process.env.YOUTUBE_API_KEY) {
    missing.push('YOUTUBE_API_KEY (required for enabled YouTube sources)');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};
