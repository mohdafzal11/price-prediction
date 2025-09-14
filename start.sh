#!/bin/sh
set -e

# Create logs directory if it doesn't exist
mkdir -p /app/logs

echo "$(date): Setting up cron jobs" > /app/logs/container.log

# Log Python environment details
echo "=============================================================" >> /app/logs/container.log
echo "Python version: $(python3 --version 2>&1)" >> /app/logs/container.log
echo "Installed packages:" >> /app/logs/container.log
pip list >> /app/logs/container.log
echo "=============================================================" >> /app/logs/container.log

# Display crontab contents for logging
echo "Crontab configuration:" >> /app/logs/container.log
echo "=============================================================" >> /app/logs/container.log
cat /app/crontab >> /app/logs/container.log
echo "=============================================================" >> /app/logs/container.log

# Install crontab
crontab /app/crontab

# Start cron daemon in the background
service cron start || crond -b

echo "$(date): Cron daemon started" >> /app/logs/container.log

# Check if scripts exist and log warnings if missing
if [ ! -f /app/scripts/scraper.js ]; then
  echo "WARNING: JavaScript scraper not found at /app/scripts/scraper.js" >> /app/logs/container.log
fi

if [ ! -f /app/scripts/twitter_scraper.py ]; then
  echo "WARNING: Python Twitter scraper not found at /app/scripts/twitter_scraper.py" >> /app/logs/container.log
fi

echo "$(date): Cron setup complete" >> /app/logs/container.log