# Multi-stage build for OpenFaith Frontend (TanStack Start + Bun Server)
# Build context: Root directory (to access workspace dependencies)

FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files and workspace structure for better layer caching
COPY package.json bun.lockb ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY patches/ ./patches/
COPY backend/ ./backend/
COPY adapters/ ./adapters/
COPY tooling/ ./tooling/
COPY apps/openfaith/package.json ./apps/openfaith/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all source code
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

# Build the frontend using Turbo (creates both public static files and server)
RUN bun run build --filter=@openfaith/openfaith

# Production stage: Run with Bun server
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy the built application (both public and server components)
COPY --from=builder /app/apps/openfaith/.output ./
# Copy the server-side node_modules that were built specifically for the server
COPY --from=builder /app/apps/openfaith/.output/server/node_modules ./node_modules

# Create non-root user for security
RUN addgroup --system --gid 1001 bun
RUN adduser --system --uid 1001 --gid 1001 bun
USER bun

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

EXPOSE 3000

# Run the Bun server
CMD ["bun", "run", "server/index.mjs"]