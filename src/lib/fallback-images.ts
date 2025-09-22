// Fallback images for different sources
export const fallbackImages = {
  'ESPN Fantasy Football': '/images/default-fantasy-logo.svg',
  'RotoWire Fantasy Football': '/images/rotowire-logo.svg',
  'FantasySP': '/images/fantasysp-logo.svg',
  'FantasyPros': '/images/default-fantasy-logo.svg',
  'NFL.com News': '/images/default-fantasy-logo.svg',
  'The Fantasy Footballers': '/images/default-fantasy-logo.svg',
  'Fantasy Footballers Podcast': '/images/default-fantasy-logo.svg',
  'Fantasy Football Today': '/images/default-fantasy-logo.svg',
  'default': '/images/default-fantasy-logo.svg'
};

// Get fallback image for a source
export function getFallbackImage(sourceName: string): string {
  return fallbackImages[sourceName as keyof typeof fallbackImages] || fallbackImages.default;
}

// Check if an image URL is valid/accessible
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  
  // Basic URL validation
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Get the best available image (thumbnail or fallback)
export function getBestImage(thumbnailUrl: string | undefined, sourceName: string): string {
  if (isValidImageUrl(thumbnailUrl)) {
    return thumbnailUrl!;
  }
  return getFallbackImage(sourceName);
}
