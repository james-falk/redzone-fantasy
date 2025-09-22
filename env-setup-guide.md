# Environment Setup Guide

After setting up MongoDB Atlas, create a `.env.local` file in your project root with:

```bash
# MongoDB Atlas Connection (Required)
MONGODB_URI=mongodb+srv://redzone_admin:YOUR_PASSWORD_HERE@redzone-fantasy-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=redzone_fantasy

# YouTube API (Optional for Phase I)
# YOUTUBE_API_KEY=your_youtube_api_key_here

# Logging
LOG_LEVEL=info
```

## Instructions:
1. Replace `YOUR_PASSWORD_HERE` with your actual MongoDB user password
2. Replace the cluster URL with your actual cluster URL from Atlas
3. Save as `.env.local` in project root
4. The file will be automatically ignored by git for security
