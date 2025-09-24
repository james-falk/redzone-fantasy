import { SourceConfig } from '../src/lib/types';

/**
 * Data Sources Configuration
 * 
 * This file defines all the content sources that the application will ingest from.
 * Each source specifies its type (RSS, YouTube, etc.) and configuration parameters.
 */

export const dataSources: SourceConfig[] = [
  // RSS Sources
  {
    id: 'espn-fantasy-football',
    name: 'ESPN Fantasy Football',
    type: 'article',
    enabled: true,
    url: 'https://www.espn.com/espn/rss/fantasy/football/news',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'fantasysp-rss',
    name: 'FantasySP',
    type: 'article',
    enabled: true,
    url: 'https://www.fantasysp.com/rss',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'fantasypros-rss',
    name: 'FantasyPros',
    type: 'article',
    enabled: true,
    url: 'https://www.fantasypros.com/rss/news.xml',
    updateInterval: 120, // 2 hours
  },

  // YouTube Sources
  {
    id: 'fantasy-footballers-youtube',
    name: 'The Fantasy Footballers',
    type: 'video',
    enabled: true, // Enable for testing refresh functionality
    url: 'https://www.youtube.com/@thefantasyfootballers',
    channelId: 'UCbcZGBgLhWJKNOqCu5Z8XFw',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'fantasy-football-today-youtube',
    name: 'Fantasy Football Today',
    type: 'video',
    enabled: true,
    url: 'https://www.youtube.com/@FantasyFootballToday',
    channelId: 'UCKFNs_14Ty1ClxyDYS_E5Gg',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'nfl-official-youtube',
    name: 'NFL Official',
    type: 'video',
    enabled: true, // Enable for testing refresh functionality
    url: 'https://www.youtube.com/@NFL',
    channelId: 'UCDVYQ4Zhbm3S2dlz7P1GBDg',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'fantasy-pros-youtube',
    name: 'FantasyPros YouTube',
    type: 'video',
    enabled: true,
    url: 'https://www.youtube.com/@FantasyPros',
    channelId: 'UCKFNs_14Ty1ClxyDYS_E5Gg',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'dynasty-domain-youtube',
    name: 'Dynasty Domain',
    type: 'video',
    enabled: true,
    url: 'https://www.youtube.com/@DynastyDomain',
    channelId: 'UCKFNs_14Ty1ClxyDYS_E5Gg',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'dynasty-league-football-youtube',
    name: 'Dynasty League Football',
    type: 'video',
    enabled: true,
    url: 'https://www.youtube.com/@DynastyLeagueFootball',
    channelId: 'UCKFNs_14Ty1ClxyDYS_E5Gg',
    updateInterval: 120, // 2 hours
  },
  {
    id: 'flock-fantasy-youtube',
    name: 'Flock Fantasy',
    type: 'video',
    enabled: true,
    url: 'https://www.youtube.com/@FlockFantasy',
    channelId: 'UCKFNs_14Ty1ClxyDYS_E5Gg',
    updateInterval: 120, // 2 hours
  },

  // Additional YouTube channels for testing refresh functionality
];

/**
 * Get all enabled sources
 */
export function getEnabledSources(): SourceConfig[] {
  return dataSources.filter(source => source.enabled);
}

/**
 * Get sources by type
 */
export function getSourcesByType(type: 'article' | 'video' | 'podcast'): SourceConfig[] {
  return dataSources.filter(source => source.enabled && source.type === type);
}

/**
 * Get source by ID
 */
export function getSourceById(id: string): SourceConfig | undefined {
  return dataSources.find(source => source.id === id);
}

/**
 * Validate required environment variables
 */
export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = ['MONGODB_URI'];
  const missing: string[] = [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
