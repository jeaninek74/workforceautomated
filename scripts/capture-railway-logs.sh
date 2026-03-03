#!/bin/bash
# WorkforceAutomated — Railway Log Capture Script
# Usage: RAILWAY_TOKEN=<token> ./scripts/capture-railway-logs.sh

set -e

LOG_DIR="railway-logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/railway-${TIMESTAMP}.log"

mkdir -p "$LOG_DIR"

echo "=== WorkforceAutomated Railway Log Capture ===" | tee "$LOG_FILE"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "ERROR: RAILWAY_TOKEN is not set. Export it first:" | tee -a "$LOG_FILE"
  echo "  export RAILWAY_TOKEN=<your-token>" | tee -a "$LOG_FILE"
  exit 1
fi

echo "Fetching Railway deployment status..." | tee -a "$LOG_FILE"
railway status 2>&1 | tee -a "$LOG_FILE" || echo "Could not fetch status" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "=== Recent Deployment Logs ===" | tee -a "$LOG_FILE"
railway logs 2>&1 | tee -a "$LOG_FILE" || echo "Could not fetch logs" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "=== Log saved to: $LOG_FILE ===" | tee -a "$LOG_FILE"
echo "Log capture complete."
