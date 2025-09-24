import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Cron Status Endpoint
 * 
 * Returns recent cron job execution logs and status information.
 * This endpoint helps monitor the scheduled ingestion system.
 */
export async function GET(request: NextRequest) {
  try {
    const response = {
      status: 'active',
      schedule: 'Every 2 hours (0 */2 * * *)',
      nextRuns: [
        new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      ],
      recentLogs: [] as any[],
      timestamp: new Date().toISOString(),
    };

    // Try to read recent logs
    try {
      const logPath = resolve(process.cwd(), 'logs', 'combined.log');
      const logContent = readFileSync(logPath, 'utf-8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      
      // Get recent cron-related logs (last 50 lines, filtered for cron activity)
      const recentCronLogs = logLines
        .slice(-100) // Get last 100 lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log && (
          log.message?.includes('Scheduled ingestion') ||
          log.message?.includes('Cron Summary') ||
          log.message?.includes('cron')
        ))
        .slice(-10); // Keep last 10 cron-related logs

      response.recentLogs = recentCronLogs;
    } catch (logError) {
      // If we can't read logs, that's okay - just return empty array
      response.recentLogs = [];
    }

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get cron status',
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
