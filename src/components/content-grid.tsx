'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContentCard, ContentResponse, ContentFilters } from '@/lib/types';
import Header from './header';
import HeroSection from './hero-section';
import ContentCardComponent from './content-card';
import ContentFiltersComponent from './content-filters';
import FeaturedCarousel from './featured-carousel';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface ContentGridProps {
  initialData?: ContentResponse;
}

export default function ContentGrid({ initialData }: ContentGridProps) {
  const [data, setData] = useState<ContentResponse | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);


  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch('/api/sources?stats=true');
      if (response.ok) {
        const sourcesData = await response.json();
        const sourceNames = sourcesData.stats?.sourceStats?.map((s: { sourceName: string }) => s.sourceName) || [];
        setSources(sourceNames);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  }, []);

  const fetchContent = useCallback(async (isBackgroundRefresh = false) => {
    // Only show loading spinner for initial load, not background refreshes
    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '100', // Show 100 items per page like the example
      });

      // Add filters to params
      if (filters.type) params.append('type', filters.type);
      if (filters.sourceName) params.append('source', filters.sourceName);
      if (filters.searchQuery) params.append('search', filters.searchQuery);
      if (filters.dateRange?.start) {
        params.append('startDate', filters.dateRange.start.toISOString());
      }
      if (filters.dateRange?.end) {
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      // Add cache-busting parameter for background refresh
      if (isBackgroundRefresh) {
        params.append('_t', Date.now().toString());
      }

      const response = await fetch(`/api/content?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentData: ContentResponse = await response.json();
      setData(contentData);
      
      if (isBackgroundRefresh) {
        const refreshTime = new Date();
        setLastRefresh(refreshTime);
        console.log('🎉 Background refresh completed successfully!');
        console.log(`📊 Updated content: ${contentData.content.length} items, Total: ${contentData.pagination.total}`);
        console.log(`⏰ Refresh completed at: ${refreshTime.toLocaleString()}`);
        console.log(`📅 Next refresh scheduled for: ${new Date(Date.now() + (2 * 60 * 60 * 1000)).toLocaleString()}`);
      }
    } catch (error) {
      if (isBackgroundRefresh) {
        console.error('❌ Background refresh failed:', error);
        console.log(`⏰ Failed at: ${new Date().toLocaleString()}`);
        console.log(`🔄 Will retry at next scheduled interval: ${new Date(Date.now() + (2 * 60 * 60 * 1000)).toLocaleString()}`);
      } else {
        console.error('Error fetching content:', error);
        setError('Failed to load content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  // Fetch sources for filter dropdown
  useEffect(() => {
    fetchSources();
  }, []);

  // Fetch content when filters or page changes
  useEffect(() => {
    if (!initialData || currentPage !== 1 || Object.keys(filters).length > 0) {
      fetchContent();
    }
  }, [filters, currentPage, fetchContent, initialData]);

  // Set up automatic background refresh
  useEffect(() => {
    // Set up interval for background refresh every 2 hours (7200000ms)
    const REFRESH_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
    
    // For testing purposes, you can temporarily use a shorter interval:
    // const REFRESH_INTERVAL = 30 * 1000; // 30 seconds (for testing only)
    
    console.log('🔄 Background refresh system initialized');
    console.log(`⏰ Refresh interval set to: ${REFRESH_INTERVAL / 1000 / 60} minutes (${REFRESH_INTERVAL / 1000 / 60 / 60} hours)`);
    console.log(`📅 Next refresh scheduled for: ${new Date(Date.now() + REFRESH_INTERVAL).toLocaleString()}`);
    
    const interval = setInterval(() => {
      const now = new Date();
      console.log(`🔍 Background refresh check at ${now.toLocaleTimeString()}`);
      console.log(`📊 Current state - Page: ${currentPage}, Filters: ${Object.keys(filters).length > 0 ? JSON.stringify(filters) : 'none'}`);
      
      // Only do background refresh if we're on the first page with no filters
      // This prevents disrupting user's current view
      if (currentPage === 1 && Object.keys(filters).length === 0) {
        console.log('✅ Conditions met - Starting background refresh...');
        fetchContent(true);
      } else {
        console.log('⏸️ Background refresh skipped - User is browsing filtered/paginated content');
        console.log(`📅 Next refresh attempt: ${new Date(Date.now() + REFRESH_INTERVAL).toLocaleTimeString()}`);
      }
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      console.log('🛑 Background refresh system cleaned up');
      clearInterval(interval);
    };
  }, [currentPage, filters, fetchContent]);

  const handleFiltersChange = (newFilters: ContentFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchContent}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
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
    <div>
      <Header />
      <HeroSection />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Featured Content Carousel */}
        {data && data.content.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold content-title">Featured Content</h2>
              <p className="content-text mt-1">Hand-picked fantasy football insights and analysis</p>
            </div>

            <FeaturedCarousel content={data.content} />
          </section>
        )}

        {/* Latest Fantasy Content Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold content-title mb-2">Latest Fantasy Content</h2>
            <p className="content-text">
              Stay ahead of the game with fresh fantasy football content from top creators, analysts, and news sources. Updated daily with the latest insights, rankings, and strategies.
            </p>
          </div>

          {/* Filters */}
          <ContentFiltersComponent
            filters={filters}
            sources={sources}
            onFiltersChange={handleFiltersChange}
          />

          {/* Results Info */}
          {data && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm content-text">
                Showing {data.content.length} of {data.pagination.total} items
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && !data && (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 loading-text">Loading content...</span>
            </div>
          )}

          {/* Content Grid */}
          {data && (
            <>
              {data.content.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {data.content.map((content) => (
                    <ContentCardComponent key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="no-content-text text-lg">No content found matching your criteria.</p>
                  <p className="no-content-subtext text-sm mt-2">
                    Try adjusting your filters or refresh the content.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div className="text-center mt-4 text-sm text-gray-500">
                Page {currentPage} of {data.pagination.totalPages} • Showing {data.content.length} of {data.pagination.total} total items
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
