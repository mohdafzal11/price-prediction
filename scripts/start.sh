#!/bin/sh
# Set up log directories
mkdir -p /app/logs
touch /app/logs/scraper.log
touch /app/logs/twitter_scraper.log
chmod -R 755 /app/logs

# Set environment variables for scripts
export NODE_PATH=/app/node_modules
export PYTHONPATH=/app

# Start cron in the background
crond -f -l 8 &

# Start the Next.js application
cd /app && pnpm start 