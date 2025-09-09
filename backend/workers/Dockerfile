# Effect Workflow Workers Dockerfile
FROM oven/bun:1.2.20 AS base
RUN apt-get update && apt-get install -y python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# copy workspace and install dependencies directly
FROM base AS release
# Copy entire workspace
COPY . .

# Install production dependencies directly (excludes dev dependencies for faster builds)
RUN bun install --no-dev

# Stay in root directory
WORKDIR /usr/src/app

# Expose port
EXPOSE 3020

# Run the workers service
CMD ["bun", "run", "--filter", "@openfaith/workers", "dev"]
