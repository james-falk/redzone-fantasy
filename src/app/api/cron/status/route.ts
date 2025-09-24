import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Cron Status Endpoint
 * 
 * Returns recent cron job execution logs and status information.
 * This endpoint helps monitor the daily scheduled ingestion system.
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(22, 0, 0, 0); // 6:00 PM EST = 22:00 UTC
    
    // If it's already past 6 PM today, schedule for tomorrow
    if (now.getHours() >= 22) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const response = {
      status: 'active',
      schedule: 'Daily at 6:00 PM EST (22:00 UTC)',
      cronExpression: '0 22 * * *',
      planLimitation: 'Vercel Hobby plan - limited to daily cron jobs',
      nextRun: nextRun.toISOString(),
      nextRunLocal: nextRun.toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      }),
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
          log.message?.includes('scheduled ingestion') ||
          log.message?.includes('Daily Cron Summary') ||
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
