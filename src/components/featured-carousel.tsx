'use client';

import { useState, useEffect } from 'react';
import { ContentCard } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getBestImage } from '@/lib/fallback-images';
import { sourceNameToSlug } from '@/lib/utils';

interface FeaturedCarouselProps {
  content: ContentCard[];
}

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

const formatDate = (dateString: string) => {
  try {
    const publishedDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now.getTime() - publishedDate.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff <= 24) {
      return publishedDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
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

export default function FeaturedCarousel({ content }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredContent = content.slice(0, 5); // Take first 5 items

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredContent.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (featuredContent.length === 0) {
    return null;
  }

  const currentArticle = featuredContent[currentIndex];
  const imageUrl = getBestImage(currentArticle.thumbnailUrl, currentArticle.sourceName);

  return (
    <div className="relative featured-carousel rounded-lg overflow-hidden">
      {/* Main Featured Article */}
      <div className="relative h-96 md:h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={currentArticle.title}
            fill
            className="object-cover opacity-30"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
          <div className="absolute inset-0 featured-overlay"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex items-end p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                FEATURED
              </span>
              <Link 
                href={`/sources/${sourceNameToSlug(currentArticle.sourceName)}`}
                className="featured-source inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
              >
                {getSimplifiedSourceName(currentArticle.sourceName)}
              </Link>
            </div>

            <a 
              href={currentArticle.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              <h2 className="text-3xl md:text-4xl font-bold featured-title mb-4 transition-colors">
                {currentArticle.title}
              </h2>
            </a>

            {currentArticle.description && (
              <p className="featured-description text-lg mb-4 line-clamp-2">
                {currentArticle.description}
              </p>
            )}

            <div className="flex items-center featured-meta text-sm">
              <span>{formatDate(currentArticle.publishedAt)}</span>
              {currentArticle.author && (
                <>
                  <span className="mx-2">•</span>
                  <span>By {currentArticle.author}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 featured-nav-button rounded-full"
          aria-label="Previous article"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 featured-nav-button rounded-full"
          aria-label="Next article"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {featuredContent.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex 
                ? 'bg-red-600' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to article ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail Strip */}
      <div className="featured-thumbnail-strip p-4">
        <div className="flex space-x-4 overflow-x-auto">
          {featuredContent.map((article, index) => {
            const thumbImageUrl = getBestImage(article.thumbnailUrl, article.sourceName);
            return (
              <button
                key={article.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden transition-opacity ${
                  index === currentIndex ? 'opacity-100 ring-2 ring-red-600' : 'opacity-50 hover:opacity-75'
                }`}
              >
                <Image
                  src={thumbImageUrl}
                  alt={article.title}
                  width={80}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
