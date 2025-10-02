#!/bin/bash
set -e

echo "Building application with runtime environment variables..."
TURBO_CONCURRENCY=1 bun run build --filter=@openfaith/openfaith

echo "Build complete. Starting application..."
exec bun run --filter=@openfaith/openfaith start
