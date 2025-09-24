import { NextRequest, NextResponse } from 'next/server';
import { ingestionOrchestrator } from '../../../../../modules/ingestion-orchestrator';
import { logger } from '@/lib/logger';

/**
 * Scheduled Content Ingestion Endpoint
 * 
 * This endpoint is called by Vercel Cron Jobs daily at 6:00 PM EST to automatically
 * refresh content from all configured sources.
 * 
 * Cron Schedule: "0 22 * * *" (daily at 6:00 PM EST / 10:00 PM UTC)
 * Note: Vercel Hobby accounts are limited to daily cron jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Debug: Check environment variables
    logger.info('🔍 Cron endpoint debug', {
      hasCronSecret: !!process.env.CRON_SECRET,
      cronSecretPreview: process.env.CRON_SECRET?.substring(0, 10) + '...',
      authHeader: request.headers.get('authorization')?.substring(0, 20) + '...',
    });

    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      logger.error('❌ CRON_SECRET environment variable not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    if (authHeader !== expectedAuth) {
      logger.warn('Unauthorized cron request attempt', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        authProvided: !!authHeader,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    logger.info('🕐 Daily scheduled ingestion started', {
      timestamp: new Date().toISOString(),
      trigger: 'daily-cron-job',
      schedule: '6:00 PM EST daily',
    });

    // Run ingestion for all sources
    const results = await ingestionOrchestrator.ingestAll();

    // Calculate detailed summary stats
    const summary = {
      totalSources: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalProcessed: results.reduce((sum, r) => sum + r.itemsProcessed, 0),
      totalSaved: results.reduce((sum, r) => sum + r.itemsSaved, 0),
      duration: Date.now() - startTime,
      durationMinutes: Math.round((Date.now() - startTime) / 1000 / 60 * 100) / 100,
    };

    // Create detailed breakdown by source
    const sourceBreakdown = results.map(r => ({
      sourceId: r.sourceId,
      success: r.success,
      processed: r.itemsProcessed,
      saved: r.itemsSaved,
      errors: r.errors.length > 0 ? r.errors : undefined,
    }));

    // Log comprehensive results
    logger.info('✅ Daily scheduled ingestion completed', {
      ...summary,
      timestamp: new Date().toISOString(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next run in 24 hours
      sourceBreakdown,
    });

    // Log a human-readable summary
    logger.info(`📊 Daily Cron Summary: ${summary.totalSaved} new items saved from ${summary.successful}/${summary.totalSources} sources in ${summary.durationMinutes} minutes`, {
      newArticles: summary.totalSaved,
      successfulSources: summary.successful,
      totalSources: summary.totalSources,
      duration: summary.durationMinutes,
      timestamp: new Date().toISOString(),
      schedule: 'Daily at 6:00 PM EST',
    });

    // Log any failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      logger.warn('⚠️ Some sources failed during daily scheduled ingestion', {
        failures: failures.map(f => ({
          sourceId: f.sourceId,
          errors: f.errors,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Daily scheduled ingestion completed: ${summary.totalSaved} new items from ${summary.successful}/${summary.totalSources} sources`,
      summary,
      sourceBreakdown,
      results,
      timestamp: new Date().toISOString(),
      nextScheduledRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      schedule: 'Daily at 6:00 PM EST',
    });

  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error('❌ Daily scheduled ingestion failed', {
      error: errorMessage,
      stack: (error as Error).stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Daily scheduled ingestion failed',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint (for testing)
 * POST /api/cron/ingest
 */
export async function POST(request: NextRequest) {
  try {
    logger.info('🔧 Manual daily cron ingestion triggered', {
      timestamp: new Date().toISOString(),
      trigger: 'manual-api-call',
    });

    // Run the same logic as the cron job
    const response = await GET(request);
    return response;

  } catch (error) {
    logger.error('Manual daily cron ingestion failed', { error: (error as Error).message });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Manual daily cron ingestion failed',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
