# Backend API Server Dockerfile
FROM oven/bun:1.2.20 AS base
RUN apt-get update && apt-get install -y python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# copy workspace and install dependencies directly
FROM base AS release
# Copy entire workspace
COPY . .

# Install production dependencies directly (excludes dev dependencies for faster builds)
RUN bun install --no-dev --ignore-scripts

# Change to the server directory for running
WORKDIR /usr/src/app/backend/server

# Expose port
EXPOSE 4000

# Run the server
CMD ["bun", "run", "main.ts"]
