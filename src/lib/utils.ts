// Utility functions

/**
 * Convert source name to URL-friendly slug
 */
export function sourceNameToSlug(sourceName: string): string {
  return sourceName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
}

/**
 * Convert slug back to source name (for display)
 */
export function slugToSourceName(slug: string): string {
  // Handle special cases for known sources
  const specialCases: { [key: string]: string } = {
    'espn-fantasy-football': 'ESPN Fantasy Football',
    'fantasysp': 'FantasySP',
    'fantasypros': 'FantasyPros',
    'nfl-com-news': 'NFL.com News',
    'the-fantasy-footballers': 'The Fantasy Footballers',
    'fantasy-football-today': 'Fantasy Football Today',
  };

  if (specialCases[slug]) {
    return specialCases[slug];
  }

  // Default conversion for other slugs
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
