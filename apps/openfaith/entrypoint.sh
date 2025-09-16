#!/bin/bash
set -e

echo "Building application with runtime environment variables..."
bun run build --filter=@openfaith/openfaith

echo "Build complete. Starting application..."
exec bun run --filter=@openfaith/openfaith start
