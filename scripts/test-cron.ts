#!/usr/bin/env node

/**
 * Test Script for Daily Cron Ingestion Endpoint
 * 
 * This script tests the daily scheduled ingestion endpoint locally.
 * 
 * Usage:
 *   npx tsx scripts/test-cron.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Debug: Check if CRON_SECRET is loaded
console.log('🔍 Environment check:');
console.log('- Current working directory:', process.cwd());
console.log('- CRON_SECRET loaded:', !!process.env.CRON_SECRET);
console.log('- CRON_SECRET preview:', process.env.CRON_SECRET?.substring(0, 10) + '...');

async function testCronEndpoint() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  let cronSecret = process.env.CRON_SECRET;

  // Fallback: If dotenv didn't load it, use the known secret for testing
  if (!cronSecret) {
    console.log('⚠️ CRON_SECRET not loaded from .env.local, using fallback for testing');
    cronSecret = '3e840939b8df8b8ef91de244a9093d785c3b4dc90c02e005516305d28248e545';
  }

  console.log('🧪 Testing daily cron ingestion endpoint...');
  console.log(`📍 URL: ${baseUrl}/api/cron/ingest`);
  console.log(`🔐 Using CRON_SECRET: ${cronSecret.substring(0, 8)}...`);
  console.log('⏰ Schedule: Daily at 6:00 PM EST (Vercel Hobby plan)');

  try {
    const response = await fetch(`${baseUrl}/api/cron/ingest`, {
      method: 'POST', // Using POST for manual testing
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Daily cron endpoint test successful!');
      console.log('📊 Summary:', data.summary);
      console.log('🕐 Timestamp:', data.timestamp);
      console.log('📅 Next scheduled run:', data.nextScheduledRun);
      console.log('⏰ Schedule:', data.schedule);
      
      if (data.summary.failed > 0) {
        console.log('⚠️ Some sources failed - check logs for details');
      }

      if (data.sourceBreakdown) {
        console.log('\n📋 Source Breakdown:');
        data.sourceBreakdown.forEach((source: any) => {
          const status = source.success ? '✅' : '❌';
          console.log(`  ${status} ${source.sourceId}: ${source.saved} saved / ${source.processed} processed`);
        });
      }
    } else {
      console.error('❌ Daily cron endpoint test failed');
      console.error('Status:', response.status);
      console.error('Response:', data);
    }
  } catch (error) {
    console.error('❌ Network error testing daily cron endpoint:', (error as Error).message);
    console.error('💡 Make sure your development server is running (npm run dev)');
  }
}

// Run the test
testCronEndpoint().catch(console.error);
