# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.20 AS base
# Install Python and build tools for native dependencies
RUN apt-get update && apt-get install -y python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# copy workspace and install dependencies directly
FROM base AS release
# Copy entire workspace
COPY . .

# Install production dependencies directly (excludes dev dependencies for faster builds)
RUN bun install --no-dev --ignore-scripts

# Stay in root directory
WORKDIR /usr/src/app

# Copy and set up the entrypoint script
COPY ./apps/openfaith/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Change ownership of the entire workspace to the bun user
RUN chown -R bun:bun /usr/src/app

# run the app
USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production
ENTRYPOINT [ "entrypoint.sh" ]
