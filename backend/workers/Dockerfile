# Effect Workflow Workers Dockerfile
FROM oven/bun:1.2.20 AS base
RUN apt-get update && apt-get install -y python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# copy workspace and install dependencies directly
FROM base AS release
# Copy entire workspace
COPY . .

# Install production dependencies directly (excludes dev dependencies for faster builds)
RUN bun install --no-dev --ignore-scripts

# [optional] tests & build
ENV NODE_ENV=production
# Build from root using turbo filter
RUN bun run build --filter=@openfaith/workers

# Copy geo-tz data directory (CRITICAL - needed at runtime)
RUN mkdir -p /usr/src/app/geo-tz-data && \
    cp -r /usr/src/app/node_modules/geo-tz/data /usr/src/app/geo-tz-data/

# Set environment variable for geo-tz to find its data
ENV GEO_TZ_DATA_PATH=/usr/src/app/geo-tz-data/data

# Stay in root directory
WORKDIR /usr/src/app

# Expose port
EXPOSE 3020
EXPOSE 34431

# Run the workers service
CMD ["bun", "run", "--filter", "@openfaith/workers", "start"]
