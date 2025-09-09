# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.20 AS base
# Install Python and build tools for native dependencies
RUN apt-get update && apt-get install -y python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# Build arguments for VITE environment variables
ARG VITE_ZERO_SERVER
ARG VITE_APP_NAME
ARG VITE_BASE_URL
ARG VITE_PROD_ROOT_DOMAIN
ARG VITE_PROD_EMAIL_DOMAIN
ARG VITE_PLANNING_CENTER_CLIENT_ID

# copy workspace and install dependencies directly
FROM base AS release
# Copy entire workspace
COPY . .

# Install production dependencies directly (excludes dev dependencies for faster builds)
RUN bun install --no-dev

# Set environment variables for build
ENV VITE_ZERO_SERVER=$VITE_ZERO_SERVER
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_PROD_ROOT_DOMAIN=$VITE_PROD_ROOT_DOMAIN
ENV VITE_PROD_EMAIL_DOMAIN=$VITE_PROD_EMAIL_DOMAIN
ENV VITE_PLANNING_CENTER_CLIENT_ID=$VITE_PLANNING_CENTER_CLIENT_ID

# [optional] tests & build
ENV NODE_ENV=production
# Build from root using turbo filter
RUN bun run build --filter=@openfaith/openfaith

# Stay in root directory
WORKDIR /usr/src/app

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "--filter", "@openfaith/openfaith", "start" ]
