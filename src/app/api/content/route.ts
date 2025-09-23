import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { ContentFilters, ContentResponse } from '@/lib/types';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 items per page
    const type = searchParams.get('type') || undefined;
    const sourceName = searchParams.get('source') || undefined;
    const searchQuery = searchParams.get('search') || undefined;
    
    // Parse date range
    let dateRange;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    const filters: ContentFilters = {
      type: type as 'rss' | 'youtube' | undefined,
      sourceName,
      dateRange,
      searchQuery,
    };

    // Check if database is available
    if (!process.env.MONGODB_URI) {
      // Return empty response when no database is configured
      const response: ContentResponse = {
        content: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        filters,
      };

      logger.info('Content API request processed (no database)', { filters });
      return NextResponse.json(response);
    }

    // Connect to database
    await database.connect();

    // Fetch content
    const { content, total } = await database.getContent(filters, page, limit);

    const response: ContentResponse = {
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters,
    };

    logger.info('Content API request processed', {
      page,
      limit,
      total,
      filters,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Content API error', { error: (error as Error).message });
    
    // Return empty response instead of error to show layout
    const response: ContentResponse = {
      content: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      filters: {},
    };

    return NextResponse.json(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint could be used for manual content creation/updates
    // For now, we'll return method not allowed
    return NextResponse.json(
      { error: 'Method not allowed. Content is managed through ingestion.' },
      { status: 405 }
    );
  } catch (error) {
    logger.error('Content POST API error', { error: (error as Error).message });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
