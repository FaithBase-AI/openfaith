# Effect Workflow Workers Dockerfile
FROM oven/bun:1.2.20 AS base
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
RUN bun install --frozen-lockfile || bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
WORKDIR /temp/prod

# Copy entire workspace
COPY . .

# Remove lockfile to avoid conflicts
RUN rm bun.lock

RUN bun install --production --frozen-lockfile || bun install --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
# Copy the entire monorepo structure
COPY . .

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
# Copy the entire workspace to maintain monorepo structure
COPY . .

# Stay in root directory
WORKDIR /usr/src/app

# Expose port
EXPOSE 3020

# Run the workers service
CMD ["bun", "run", "--filter", "@openfaith/workers", "dev"]
