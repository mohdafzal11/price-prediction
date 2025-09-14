#!/bin/bash

# Daily Crypto Prediction Pre-computation Job
# This script runs daily to pre-compute all prediction data
# Run via cron: 0 2 * * * /path/to/this/script.sh

# Set environment variables
export NODE_ENV=production
export PRECOMPUTE_AUTH_KEY="${PRECOMPUTE_AUTH_KEY:-your-secure-key-here}"

# Configuration
API_URL="http://localhost:3000"  # Adjust for your deployment
LOG_FILE="/tmp/precompute-predictions.log"
MAX_LOG_SIZE=10485760  # 10MB

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to rotate logs if they get too large
rotate_logs() {
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null) -gt $MAX_LOG_SIZE ]; then
        mv "$LOG_FILE" "${LOG_FILE}.old"
        log "Log rotated due to size limit"
    fi
}

# Function to send notification (customize as needed)
send_notification() {
    local status=$1
    local message=$2
    # Add your notification logic here (Slack, email, etc.)
    log "NOTIFICATION: [$status] $message"
}

# Main execution
main() {
    log "=== Starting Daily Prediction Pre-computation ==="
    
    # Rotate logs if needed
    rotate_logs
    
    # Check if the API is running
    if ! curl -f -s "$API_URL/api/health" > /dev/null 2>&1; then
        log "ERROR: API is not responding at $API_URL"
        send_notification "ERROR" "Prediction precompute failed - API not responding"
        exit 1
    fi
    
    log "API health check passed"
    
    # Run the precompute job
    log "Starting prediction pre-computation..."
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "x-precompute-key: $PRECOMPUTE_AUTH_KEY" \
        "$API_URL/api/jobs/precompute-predictions")
    
    # Extract HTTP status and body
    HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        log "✅ Precompute job completed successfully"
        
        # Parse and log summary (if JSON parsing is available)
        if command -v jq >/dev/null 2>&1; then
            COMPLETED=$(echo "$BODY" | jq -r '.summary.completed // "N/A"')
            TOTAL=$(echo "$BODY" | jq -r '.summary.totalTokens // "N/A"')
            TIME=$(echo "$BODY" | jq -r '.summary.processingTime // "N/A"')
            log "Summary: $COMPLETED/$TOTAL tokens processed in $TIME"
        fi
        
        send_notification "SUCCESS" "Daily predictions precomputed successfully"
    else
        log "❌ Precompute job failed with HTTP $HTTP_STATUS"
        log "Response: $BODY"
        send_notification "ERROR" "Prediction precompute failed with HTTP $HTTP_STATUS"
        exit 1
    fi
    
    log "=== Daily Prediction Pre-computation Complete ==="
}

# Error handling
set -e
trap 'log "ERROR: Script failed at line $LINENO"' ERR

# Run main function
main "$@"
