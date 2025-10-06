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

# Fake resend api key for prerender. This doesn't get baked into the output, but is needed for prerender to succeed 
# without failing.
# Fake better auth secret key for prerender. This doesn't get baked into the output, but is needed for prerender to   
# succeed without failing.
# Build from root using turbo filter
RUN cd apps/openfaith && RESEND_API_KEY=re_123 BETTER_AUTH_SECRET=auth_build bun run build

# Stay in root directory
WORKDIR /usr/src/app

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "--filter", "@openfaith/openfaith", "start" ]