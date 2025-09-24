import { ContentCard } from '@/lib/types';
import { Calendar, ExternalLink, Play, Headphones, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getBestImage } from '@/lib/fallback-images';
import { sourceNameToSlug } from '@/lib/utils';

interface ContentCardProps {
  content: ContentCard;
  featured?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Play className="w-4 h-4" />;
    case 'podcast':
      return <Headphones className="w-4 h-4" />;
    case 'article':
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'video':
      return 'YOUTUBE';
    case 'podcast':
      return 'PODCAST';
    case 'article':
    default:
      return 'NEWS';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'bg-red-600 text-white';
    case 'podcast':
      return 'bg-purple-600 text-white';
    case 'article':
    default:
      return 'bg-blue-600 text-white';
  }
};

const getSimplifiedSourceName = (sourceName: string) => {
  switch (sourceName) {
    case 'ESPN Fantasy Football':
      return 'ESPN';
    case 'FantasySP':
      return 'FantasySP';
    case 'FantasyPros':
      return 'FantasyPros';
    case 'NFL.com News':
      return 'NFL.com';
    case 'The Fantasy Footballers':
      return 'Fantasy Footballers';
    case 'Fantasy Football Today':
      return 'Fantasy Today';
    default:
      return sourceName;
  }
};

export default function ContentCardComponent({ content, featured = false }: ContentCardProps) {
  // Defensive check to ensure content exists
  if (!content) {
    console.warn('ContentCardComponent received undefined content');
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      const publishedDate = new Date(dateString);
      const now = new Date();
      const timeDiff = now.getTime() - publishedDate.getTime();
      const hoursDiff = timeDiff / (1000 * 3600); // Convert to hours

      // If published within the last 24 hours, show date and time
      if (hoursDiff <= 24) {
        return publishedDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      } else {
        // If older than 24 hours, show just the date
        return publishedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      return 'Unknown date';
    }
  };

  const imageUrl = getBestImage(content.thumbnailUrl, content.sourceName);

  if (featured) {
    return (
      <div className="content-card rounded-lg overflow-hidden group">
        {/* Thumbnail */}
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative h-48 w-full overflow-hidden bg-gray-100"
        >
          <Image
            src={imageUrl}
            alt={content.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              FEATURED
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(content.type)}`}>
              {getTypeLabel(content.type)}
            </span>
          </div>
        </a>

        <div className="p-4">
          <a 
            href={content.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-lg font-bold content-card-title mb-2 line-clamp-2 transition-colors">
              {content.title}
            </h3>
          </a>
          
          {content.description && (
            <p className="content-card-text text-sm mb-3 line-clamp-2">
              {content.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm content-card-meta">
            <Link 
              href={`/sources/${sourceNameToSlug(content.sourceName)}`}
              className="content-card-source inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors"
            >
              {getSimplifiedSourceName(content.sourceName)}
            </Link>
            <span>{formatDate(content.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card transition-all duration-200 group">
      <div className="p-4">
        {/* Header with type badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(content.type)}`}>
            {getTypeIcon(content.type)}
            <span className="ml-1 uppercase">{getTypeLabel(content.type)}</span>
          </span>
        </div>

        {/* Thumbnail */}
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative h-32 w-full mb-4 rounded overflow-hidden bg-gray-100"
        >
          <Image
            src={imageUrl}
            alt={content.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </a>

        {/* Content metadata */}
        <div className="flex items-center justify-between text-xs content-card-meta mb-3">
          <div>
            {getTypeLabel(content.type)} • {formatDate(content.publishedAt)}
          </div>
          <Link 
            href={`/sources/${sourceNameToSlug(content.sourceName)}`}
            className="content-card-source inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors"
          >
            {getSimplifiedSourceName(content.sourceName)}
          </Link>
        </div>

        <div className="text-xs content-card-meta mb-3">
          By {content.author || 'Staff Writer'}
        </div>

        {/* Title */}
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <h3 className="text-base font-bold content-card-title mb-2 line-clamp-2 transition-colors">
            {content.title}
          </h3>
        </a>

        {/* Description */}
        {content.description && (
          <p className="content-card-text text-sm line-clamp-2">
            {content.description}
          </p>
        )}
      </div>
    </div>
  );
}
