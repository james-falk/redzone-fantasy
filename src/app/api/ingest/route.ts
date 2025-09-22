import { NextRequest, NextResponse } from 'next/server';
import { ingestionOrchestrator } from '../../../../modules/ingestion-orchestrator';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sourceId } = body;

    logger.info('Manual ingestion triggered via API', { sourceId });

    let results;
    
    if (sourceId) {
      // Ingest from specific source
      logger.info(`Starting manual ingestion for source: ${sourceId}`);
      results = [await ingestionOrchestrator.ingestSource(sourceId)];
    } else {
      // Ingest from all sources
      logger.info('Starting manual ingestion for all sources');
      results = await ingestionOrchestrator.ingestAll();
    }

    // Calculate summary stats
    const summary = {
      totalSources: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalProcessed: results.reduce((sum, r) => sum + r.itemsProcessed, 0),
      totalSaved: results.reduce((sum, r) => sum + r.itemsSaved, 0),
    };

    logger.info('Manual ingestion completed via API', summary);

    return NextResponse.json({
      success: true,
      message: sourceId 
        ? `Ingestion completed for source: ${sourceId}`
        : 'Ingestion completed for all sources',
      results,
      summary,
    });
  } catch (error) {
    logger.error('Ingestion API error', { error: (error as Error).message });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Ingestion failed',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get ingestion status/history
    const moduleStatus = ingestionOrchestrator.getModuleStatus();
    
    return NextResponse.json({
      status: 'ready',
      modules: moduleStatus,
      message: 'Ingestion system is ready. Use POST to trigger ingestion.',
    });
  } catch (error) {
    logger.error('Ingestion status API error', { error: (error as Error).message });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
