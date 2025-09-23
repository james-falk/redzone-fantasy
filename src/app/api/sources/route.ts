import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { getEnabledSources, dataSources } from '../../../../config/sources';
import { ingestionOrchestrator } from '../../../../modules/ingestion-orchestrator';
import { logger } from '@/lib/logger';
import { ContentTypeEnum } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    logger.info('Sources API request started', { 
      url: request.url,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT_SET'
    });
    
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    // Get configured sources
    const configuredSources = getEnabledSources();
    
    // Get module status (this might fail if modules can't initialize, so wrap in try-catch)
    let moduleStatus: Array<{ sourceId: string; enabled: boolean }> = [];
    try {
      moduleStatus = ingestionOrchestrator.getModuleStatus();
    } catch (moduleError) {
      logger.warn('Could not get module status', { error: (moduleError as Error).message });
    }

    const response: {
      sources: Array<{
        id: string;
        name: string;
        type: ContentTypeEnum;
        enabled: boolean;
        moduleLoaded: boolean;
      }>;
      stats?: {
        totalSources: number;
        sourceStats: Array<{ sourceName: string; count: number }>;
      };
    } = {
      sources: configuredSources.map(source => ({
        id: source.id,
        name: source.name,
        type: source.type,
        enabled: source.enabled,
        moduleLoaded: moduleStatus.find(m => m.sourceId === source.id)?.enabled || false,
      })),
    };

    if (includeStats && process.env.MONGODB_URI) {
      try {
        // Connect to database to get actual source names and counts
        await database.connect();
        const dbSources = await database.getSourceNames();
        
        // Get content counts per source
        const sourceStats = await Promise.all(
          dbSources.map(async (sourceName) => {
            const { total } = await database.getContent({ sourceName }, 1, 1);
            return { sourceName, count: total };
          })
        );

        response.stats = {
          totalSources: dbSources.length,
          sourceStats,
        };
      } catch (dbError) {
        logger.warn('Could not fetch source stats from database', {
          error: (dbError as Error).message,
        });
      }
    }

    logger.info('Sources API request processed', {
      includeStats,
      sourceCount: configuredSources.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Sources API error', { error: (error as Error).message });
    
    // Return basic response instead of error
    return NextResponse.json({
      sources: [],
      stats: { totalSources: 0, sourceStats: [] }
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // This could be used to enable/disable sources dynamically
    // For now, we'll return method not allowed since sources are configured via files
    return NextResponse.json(
      { error: 'Method not allowed. Sources are configured via configuration files.' },
      { status: 405 }
    );
  } catch (error) {
    logger.error('Sources PUT API error', { error: (error as Error).message });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
