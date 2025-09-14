#!/bin/bash

# Script to purge target Redis and migrate data from source
# Usage: ./purgeAndMigrateRedis.sh <target_redis_url>

# Check if target URL is provided
if [ -z "$1" ]; then
  echo "Error: Target Redis URL is required"
  echo "Usage: ./purgeAndMigrateRedis.sh <target_redis_url>"
  exit 1
fi

TARGET_URL="$1"

echo "========================================"
echo "Redis Migration with Purge"
echo "========================================"
echo "Target Redis: $TARGET_URL"
echo "This will COMPLETELY FLUSH the target Redis database and then migrate data from source."
echo "Press CTRL+C now to cancel or wait 5 seconds to continue..."

# Wait 5 seconds to allow cancellation
sleep 5

# Run the migration script with purge option
echo "Starting Redis purge and migration..."
node migrateRedis.js --target "$TARGET_URL" --flush-target

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "========================================"
  echo "Redis migration completed successfully!"
  echo "========================================"
else
  echo "========================================"
  echo "Redis migration failed! Check the logs above for errors."
  echo "========================================"
  exit 1
fi
