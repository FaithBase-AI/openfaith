# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.20 AS base
# Install Python and build tools for native dependencies
RUN apt-get update && apt-get install -y python3 python3-dev build-essential libreadline-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
WORKDIR /temp/dev

# Copy entire workspace
COPY . .

# Install dependencies with lockfile handling
RUN bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
WORKDIR /temp/prod

# Copy entire workspace
COPY . .

RUN bun install --no-dev

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
# Copy the entire monorepo structure
COPY . .

# Build arguments for VITE environment variables
ARG VITE_ZERO_SERVER
ARG VITE_APP_NAME
ARG VITE_BASE_URL
ARG VITE_PROD_ROOT_DOMAIN
ARG VITE_PROD_EMAIL_DOMAIN
ARG VITE_PLANNING_CENTER_CLIENT_ID

# Set environment variables for build
ENV VITE_ZERO_SERVER=$VITE_ZERO_SERVER
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_PROD_ROOT_DOMAIN=$VITE_PROD_ROOT_DOMAIN
ENV VITE_PROD_EMAIL_DOMAIN=$VITE_PROD_EMAIL_DOMAIN
ENV VITE_PLANNING_CENTER_CLIENT_ID=$VITE_PLANNING_CENTER_CLIENT_ID

# [optional] tests & build
ENV NODE_ENV=production
# Run tests for the specific app
# RUN bun run test --filter=@openfaith/openfaith
# Build from root using turbo filter
RUN bun run build --filter=@openfaith/openfaith

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
# Keep the original structure - copy to apps/openfaith/
COPY --from=prerelease /usr/src/app/apps/openfaith/.output ./apps/openfaith/.output
COPY --from=prerelease /usr/src/app/apps/openfaith/package.json ./apps/openfaith/package.json

# Copy node_modules to the app directory too for module resolution
COPY --from=install /temp/prod/node_modules ./apps/openfaith/node_modules

# Stay in root directory
WORKDIR /usr/src/app

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "--filter", "@openfaith/openfaith", "start" ]
