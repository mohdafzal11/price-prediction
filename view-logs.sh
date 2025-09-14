#!/bin/sh

LOG_DIR="/app/logs"

print_usage() {
  echo "Usage: ./view-logs.sh [logfile]"
  echo "Available logs:"
  echo "  app             - Main application logs"
  echo "  app-error       - Main application error logs"
  echo "  scraper         - JavaScript scraper logs"
  echo "  scraper-error   - JavaScript scraper error logs"
  echo "  twitter         - Twitter scraper logs"
  echo "  twitter-error   - Twitter scraper error logs"
  echo "  container       - Container startup logs"
  echo "  cron            - Cron daemon logs"
  echo "  all             - Tail all logs together"
}

if [ "$1" = "" ]; then
  print_usage
  exit 1
fi

case "$1" in
  "app")
    tail -f "$LOG_DIR/app.log"
    ;;
  "app-error")
    tail -f "$LOG_DIR/app-error.log"
    ;;
  "scraper")
    tail -f "$LOG_DIR/scraper.log"
    ;;
  "scraper-error")
    tail -f "$LOG_DIR/scraper-error.log"
    ;;
  "twitter")
    tail -f "$LOG_DIR/twitter_scraper.log"
    ;;
  "twitter-error")
    tail -f "$LOG_DIR/twitter_scraper-error.log"
    ;;
  "container")
    tail -f "$LOG_DIR/container.log"
    ;;
  "cron")
    tail -f "$LOG_DIR/cron.log"
    ;;
  "all")
    tail -f "$LOG_DIR"/*.log
    ;;
  *)
    echo "Unknown log file: $1"
    print_usage
    exit 1
    ;;
esac 