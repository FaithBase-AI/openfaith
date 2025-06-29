#!/bin/bash

# PostgreSQL health check script
# Usage: health-check.sh [timeout_seconds]
# Example: health-check.sh 30

TIMEOUT=${1:-30}
INTERVAL=2
ELAPSED=0

# Database connection parameters (matching your shared env)
DB_HOST=${DB_HOST_PRIMARY:-127.0.0.1}
DB_PORT=${DB_PORT:-5430}
DB_NAME=${DB_NAME:-postgres}
DB_USER=${DB_USERNAME:-user}

echo "🔍 Checking PostgreSQL health at $DB_HOST:$DB_PORT/$DB_NAME"

while [ $ELAPSED -lt $TIMEOUT ]; do
  # Try to connect to PostgreSQL using pg_isready (more reliable than psql)
  if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -q; then
      echo "✅ PostgreSQL is ready"
      exit 0
    fi
  else
    # Fallback to basic TCP connection test if pg_isready is not available
    if timeout 3 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
      echo "✅ PostgreSQL port is accessible"
      exit 0
    fi
  fi
  
  echo "⏳ PostgreSQL not ready, waiting $INTERVAL seconds (${ELAPSED}s/${TIMEOUT}s)"
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "❌ PostgreSQL not ready after ${TIMEOUT} seconds"
exit 1 