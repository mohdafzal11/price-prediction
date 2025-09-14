#!/bin/bash

# Script to purge target database and migrate data from source
# Usage: ./purgeAndMigrate.sh <target_mongodb_url>

# Check if target URL is provided
if [ -z "$1" ]; then
  echo "Error: Target MongoDB URL is required"
  echo "Usage: ./purgeAndMigrate.sh <target_mongodb_url>"
  exit 1
fi

TARGET_URL="$1"

echo "========================================"
echo "Database Migration with Purge"
echo "========================================"
echo "Target DB: $TARGET_URL"
echo "This will COMPLETELY ERASE the target database and then migrate data from source."
echo "Press CTRL+C now to cancel or wait 5 seconds to continue..."

# Wait 5 seconds to allow cancellation
sleep 5

# Run the migration script with purge option
echo "Starting database purge and migration..."
node migrateDatabase.js --target "$TARGET_URL" --purge-target-db

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "========================================"
  echo "Migration completed successfully!"
  echo "========================================"
else
  echo "========================================"
  echo "Migration failed! Check the logs above for errors."
  echo "========================================"
  exit 1
fi
