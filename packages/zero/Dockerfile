# Zero Cache Service Dockerfile
FROM oven/bun:1.2.20 AS base
RUN apt-get update && apt-get install -y curl gnupg python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
# Install Node.js 22 (required by @rocicorp/zero)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# copy workspace and install dependencies directly
FROM base AS release
# Copy entire workspace
COPY . .

# Install production dependencies directly (excludes dev dependencies for faster builds)
# Ignore scripts to avoid running zero postinstall script
RUN bun install --no-dev

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
EXPOSE 4848

# Ensure local binaries are available to child processes (zero-deploy-permissions)
ENV PATH=/usr/src/app/node_modules/.bin:$PATH
# Set default Zero port to match container port
ENV ZERO_PORT=4848

# Run zero-cache-dev with Node and point to the project schema; postinstall creates node_modules/.zero/schema.mts for permissions
CMD ["sh", "-c", "cd /usr/src/app && node /usr/src/app/node_modules/@rocicorp/zero/out/zero/src/deploy-permissions.js -p /usr/src/app/packages/zero/zeroSchema.mts && node /usr/src/app/node_modules/.bin/zero-cache-dev -p /usr/src/app/packages/zero/zeroSchema.mts --port 4848"]
