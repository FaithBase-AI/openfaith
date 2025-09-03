# Multi-stage build for OpenFaith Backend API
# Build context: Root directory (to access workspace dependencies)

FROM node:20 AS builder

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN npm install -g bun@1.2.21

WORKDIR /app

# Copy package files and workspace structure
COPY package.json bun.lock ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY patches/ ./patches/
COPY backend/ ./backend/
COPY adapters/ ./adapters/

# Install dependencies
RUN bun install

# Production stage
FROM node:20-alpine AS production

# Install Bun in production image
RUN npm install -g bun@1.2.21

WORKDIR /app

# Copy source code and dependencies (no build step needed)
COPY --from=builder /app/backend/server ./backend/server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/adapters ./adapters

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bun -u 1001
USER bun

EXPOSE 4000

# Run TypeScript directly with Bun
CMD ["bun", "run", "backend/server/index.ts"]