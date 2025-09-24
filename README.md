# Redzone Fantasy

A Next.js application that aggregates fantasy football content from multiple sources including RSS feeds, YouTube channels, and podcasts. Built with a modular architecture for easy source management and scalability.

## Features

- **Modular Content Ingestion**: Independent modules for different content sources (RSS, YouTube, Podcasts)
- **Unified Content Schema**: All content normalized to a consistent format
- **MongoDB Database**: Persistent storage with optimized queries
- **Real-time Filtering**: Filter content by type, source, date range, and search terms
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS
- **Error Handling & Logging**: Comprehensive logging with Winston
- **Environment Management**: Secure configuration management
- **Future-Ready Authentication**: Prepared for Clerk integration

## Architecture

```
├── modules/               # Content ingestion modules
│   ├── base-ingestion.ts     # Base class for all ingestion modules
│   ├── rss-ingestion.ts      # RSS feed ingestion
│   ├── youtube-ingestion.ts  # YouTube API integration
│   └── ingestion-orchestrator.ts # Manages all ingestion modules
├── lib/                   # Shared utilities and schemas
│   ├── types.ts              # TypeScript interfaces and schemas
│   ├── database.ts           # MongoDB connection and operations
│   ├── logger.ts             # Winston logging configuration
│   └── auth.ts               # Authentication utilities (Clerk-ready)
├── config/                # Configuration files
│   └── sources.ts            # Data source configurations
├── src/app/api/           # Next.js API routes
│   ├── content/             # Content retrieval endpoints
│   ├── sources/             # Source management endpoints
│   └── ingest/              # Manual ingestion triggers
├── src/components/        # React components
│   ├── content-card.tsx     # Individual content display
│   ├── content-filters.tsx  # Filtering interface
│   └── content-grid.tsx     # Main content display grid
└── scripts/               # Utility scripts
    └── ingest.js             # Command-line ingestion script
```

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd redzone-fantasy

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp env.example .env.local

# Edit .env.local with your actual values:
# - MONGODB_URI: Your MongoDB connection string
# - YOUTUBE_API_KEY: Your YouTube Data API key (optional)
# - Other configuration as needed
```

### 3. Database Setup

Make sure you have MongoDB running. You can use:
- Local MongoDB installation
- MongoDB Atlas (cloud)
- Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

### 4. Configure Content Sources

Edit `config/sources.ts` to add, remove, or modify content sources:

```typescript
export const dataSources: SourceConfig[] = [
  {
    id: 'your-rss-source',
    name: 'Your RSS Source',
    type: 'article',
    enabled: true,
    config: {
      rssUrl: 'https://example.com/rss.xml',
      updateInterval: 30,
    },
  },
  // Add more sources...
];
```

### 5. Run the Application

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

### 6. Ingest Content

```bash
# Ingest content from all enabled sources
npm run ingest

# Or ingest from a specific source
node scripts/ingest.js --source=your-source-id
```

## Content Sources

### RSS Feeds (Articles & Podcasts)

RSS feeds are automatically parsed and content is extracted. The system handles:
- Article titles, descriptions, and publication dates
- Podcast episodes with audio links
- Image extraction from content
- Automatic deduplication

Example RSS configuration:
```typescript
{
  id: 'espn-fantasy',
  name: 'ESPN Fantasy Football',
  type: 'article',
  enabled: true,
  config: {
    rssUrl: 'https://www.espn.com/espn/rss/fantasy/football/news',
    updateInterval: 30, // minutes
  },
}
```

### YouTube Channels (Videos)

YouTube integration requires a YouTube Data API key. The system fetches:
- Recent videos from specified channels
- Video titles, descriptions, thumbnails
- Publication dates and view counts
- Direct links to YouTube videos

Example YouTube configuration:
```typescript
{
  id: 'fantasy-footballers',
  name: 'The Fantasy Footballers',
  type: 'video',
  enabled: true, // Set to false if no API key
  config: {
    channelId: 'UCcWCfwJWtDkGwAb2Jp1LMTQ',
    maxResults: 10,
    updateInterval: 60, // minutes
  },
}
```

## API Endpoints

### GET /api/content
Retrieve content with filtering and pagination.

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)
- `type` (string): Content type filter ('article', 'video', 'podcast')
- `source` (string): Source name filter
- `search` (string): Search query
- `startDate` (ISO string): Start date for date range filter
- `endDate` (ISO string): End date for date range filter

### GET /api/sources
Get information about configured sources.

Query Parameters:
- `stats` (boolean): Include database statistics

### POST /api/ingest
Trigger manual content ingestion.

Body (optional):
```json
{
  "sourceId": "specific-source-id"
}
```

## Database Schema

Content is stored in MongoDB with the following schema:

```typescript
interface ContentDocument {
  _id?: string;
  id: string;              // Unique content ID
  title: string;           // Content title
  description?: string;    // Content description
  thumbnailUrl?: string;   // Image/thumbnail URL
  sourceName: string;      // Source display name
  type: 'article' | 'video' | 'podcast';
  publishedAt: string;     // ISO date string
  url: string;            // Link to original content
  createdAt: Date;        // When ingested
  updatedAt: Date;        // Last updated
  ingestionSource?: string; // Source module ID
}
```

## Development

### Adding New Content Sources

1. Create a new ingestion module extending `BaseIngestionModule`
2. Implement the `fetchData()` method
3. Add source configuration to `config/sources.ts`
4. Update the orchestrator to handle the new source type

### Running Tests

```bash
# Run linting
npm run lint

# Check for TypeScript errors
npx tsc --noEmit
```

### Manual Ingestion

```bash
# Ingest from all sources
npm run ingest

# Ingest from specific source
node scripts/ingest.js --source=source-id

# View ingestion logs
tail -f logs/combined.log
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `YOUTUBE_API_KEY` (if using YouTube sources)
   - `MONGODB_DB_NAME`
3. Deploy

### Environment Variables

Required:
- `MONGODB_URI`: MongoDB connection string

Optional:
- `YOUTUBE_API_KEY`: YouTube Data API key
- `MONGODB_DB_NAME`: Database name (default: 'redzone_fantasy')
- `LOG_LEVEL`: Logging level (default: 'info')

## Future Enhancements

### Authentication (Clerk Integration)

The application is prepared for Clerk authentication:

1. Install Clerk: `npm install @clerk/nextjs`
2. Add Clerk environment variables
3. Update `lib/auth.ts` to use Clerk
4. Implement user favorites and personalization

### Scheduled Ingestion

The application includes built-in scheduled ingestion that automatically refreshes content daily.

#### Vercel Cron Jobs (Recommended)

The project is configured with Vercel Cron Jobs in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/ingest",
      "schedule": "0 22 * * *"
    }
  ]
}
```

**Setup:**
1. Add `CRON_SECRET` environment variable in Vercel dashboard
2. Deploy to Vercel - cron jobs will automatically start running
3. Monitor logs in Vercel dashboard or check `/logs/combined.log`

**Schedule:** Daily at 6:00 PM EST (22:00 UTC)  
**Note:** Vercel Hobby accounts are limited to daily cron jobs. Upgrade to Pro for more frequent runs.

#### Testing Locally

```bash
# Test the cron endpoint
npm run test-cron

# Manual ingestion (alternative)
npm run ingest
```

#### Alternative Cron Solutions

For non-Vercel deployments:
- **GitHub Actions**: Use workflow with `schedule` trigger
- **External cron services**: Call `POST /api/cron/ingest` with `Authorization: Bearer ${CRON_SECRET}`
- **System cron**: Use `curl` to call the endpoint

### Additional Features

- Content bookmarking/favorites
- Email notifications for new content
- Advanced search with full-text indexing
- Content categorization and tagging
- Social sharing functionality
- Mobile app with React Native

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check your `MONGODB_URI` environment variable
- Ensure MongoDB is running and accessible
- Verify network connectivity and firewall settings

**YouTube API Errors**
- Verify your `YOUTUBE_API_KEY` is valid
- Check API quotas in Google Cloud Console
- Ensure YouTube Data API v3 is enabled

**Ingestion Failures**
- Check logs in `logs/error.log`
- Verify source URLs are accessible
- Check for rate limiting or API changes

### Logs

Application logs are stored in:
- `logs/combined.log`: All log messages
- `logs/error.log`: Error messages only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the logs for error messages
- Review the configuration files
- Ensure all environment variables are set correctly
- Verify MongoDB connectivity and API keys