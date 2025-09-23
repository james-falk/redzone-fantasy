'use client';

import { useState, useEffect } from 'react';
import { ContentCard, ContentResponse } from '@/lib/types';
import Header from './header';
import ContentCardComponent from './content-card';
import { ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SourcePageProps {
  sourceName: string;
  slug: string;
}

export default function SourcePage({ sourceName, slug }: SourcePageProps) {
  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchContent();
  }, [sourceName, currentPage]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        source: sourceName,
        page: currentPage.toString(),
        limit: '20', // Show 20 items per page for source pages
      });

      const response = await fetch(`/api/content?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentData: ContentResponse = await response.json();
      setData(contentData);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen source-page-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="error-container border rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium error-title">Error</h3>
                <p className="text-sm error-text mt-1">{error}</p>
                <button
                  onClick={fetchContent}
                  className="mt-2 text-sm error-text underline hover:opacity-80"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen source-page-bg">
      <Header />
      
      {/* Source Header */}
      <div className="source-header border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Link 
              href="/"
              className="inline-flex items-center source-back-link mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold source-title mb-2">{sourceName}</h1>
              <p className="source-description">
                Fantasy football content and analysis from {sourceName}
              </p>
              {data && (
                <p className="text-sm source-meta mt-2">
                  {data.pagination.total} articles and videos available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 loading-text">Loading content...</span>
          </div>
        )}

        {/* Content Grid */}
        {data && (
          <>
            {data.content.length > 0 ? (
              <>
                {/* Results Info */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm content-text">
                    Showing {data.content.length} of {data.pagination.total} items
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {data.content.map((content) => (
                    <ContentCardComponent key={content.id} content={content} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="no-content-text text-lg">No content found from {sourceName}.</p>
                <p className="no-content-subtext text-sm mt-2">
                  Content may not have been ingested yet or the source may be temporarily unavailable.
                </p>
              </div>
            )}

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium pagination-button"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(3, data.pagination.totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 1);
                    if (page > data.pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          page === currentPage
                            ? 'pagination-button-active'
                            : 'pagination-button'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.pagination.totalPages}
                  className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium pagination-button"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {/* Page Info */}
            {data.pagination.totalPages > 1 && (
              <div className="text-center mt-4 text-sm source-meta">
                Page {currentPage} of {data.pagination.totalPages} • Showing {data.content.length} of {data.pagination.total} total items
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
