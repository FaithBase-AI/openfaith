# Zero Cache Service Dockerfile
FROM oven/bun:1.2.20 AS base
RUN apt-get update && apt-get install -y python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# copy workspace and install dependencies directly
FROM base AS release
# Copy entire workspace
COPY . .

# Install production dependencies directly (excludes dev dependencies for faster builds)
# Ignore scripts to avoid running zero postinstall script
RUN bun install --no-dev --ignore-scripts

# Create /data directory for replica file persistence
RUN mkdir -p /data && chmod 755 /data

# Stay in root directory - zero-cache-dev needs to run from project root
WORKDIR /usr/src/app

# Debug: Check file locations and permissions
RUN echo "=== DEBUG: Current working directory ===" && pwd
RUN echo "=== DEBUG: Root directory contents ===" && ls -la
RUN echo "=== DEBUG: Zero package directory contents ===" && ls -la packages/zero/
RUN echo "=== DEBUG: Zero schema file details ===" && ls -la packages/zero/zeroSchema.mts
RUN echo "=== DEBUG: Zero package.json ===" && cat packages/zero/package.json | grep -E "(type|dev)"
RUN echo "=== DEBUG: Node modules zero-cache-dev location ===" && find node_modules -name "zero-cache-dev" -type f 2>/dev/null | head -5

# Expose port
EXPOSE 4983

# Copy schema file to a location tsx can find, then run zero-cache-dev
RUN mkdir -p /tmp/zero-schema && cp /usr/src/app/packages/zero/zeroSchema.mts /tmp/zero-schema/
CMD ["sh", "-c", "cd /usr/src/app && /usr/src/app/node_modules/.bin/zero-cache-dev -p /tmp/zero-schema/zeroSchema.mts"]
