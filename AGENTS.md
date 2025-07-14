# AGENTS.md

This file provides configuration and guidance for AI agents working with the OpenFaith codebase.

## Project Overview

OpenFaith is a local-first church management system built with Effect-TS that provides a unified interface for managing church data across multiple Church Management Systems (ChMS) like Planning Center Online and Church Community Builder.

## Development Commands

### Essential Commands

- `bun run dev` - Start all development servers (frontend + backend + infrastructure)
- `bun run build` - Build all packages for production
- `bun run typecheck` - Run TypeScript checks across all packages
- `bun run check` - Run comprehensive quality checks (format, lint, typecheck, test)
- `bun run test` - Run tests across all packages

### Code Quality

- `bun run format` - Check code formatting with Biome
- `bun run format:fix` - Fix code formatting issues automatically
- `bun run lint:biome` - Run Biome linter
- `bun run lint:biome:fix` - Fix Biome linting issues
- `bun run lint:eslint` - Run ESLint with caching
- `bun run lint:eslint:fix` - Fix ESLint issues automatically

### Database & Infrastructure

- `bun run db:generate` - Generate database types from schema
- `bun run db:migrate` - Run database migrations
- `bun run infra` - Start infrastructure services (PostgreSQL, Redis, OpenTelemetry)

## Technology Stack

### Core Philosophy: Effect-TS First

This project is built around the Effect-TS ecosystem across the entire stack, providing functional programming patterns with excellent error handling, async operations, and dependency injection.

**Frontend:**

- React with Effect-TS ecosystem
- Tanstack Router for routing
- Vite for build tooling
- TailwindCSS for styling
- Effect-RX for reactive state management

**Backend:**

- Effect-TS ecosystem with Effect HTTP and RPC
- PostgreSQL with Drizzle ORM (Effect-integrated)
- Better Auth for authentication
- Temporal for durable workflows

**Infrastructure:**

- Turborepo monorepo with Bun package manager
- Rocicorp Zero for client-side sync
- Custom adapter pattern for ChMS integrations

## Architecture

### Monorepo Structure

```
apps/openfaith/          # Main React application
packages/                # Shared libraries
├── db/                  # Database schema and migrations
├── schema/              # Effect Schema definitions (CDM)
├── ui/                  # Shared UI components
├── auth/                # Authentication utilities
├── zero/                # Client-side sync configuration
└── shared/              # Common utilities
backend/                 # Server-side services
├── server/              # Main API server
├── workers/             # Temporal workflows
└── email/               # Email service
adapters/                # ChMS integration adapters
├── pco/                 # Planning Center Online
├── ccb/                 # Church Community Builder
└── adapter-core/        # Shared adapter utilities
infra/                   # Infrastructure services
```

### Data Architecture

- **Canonical Data Model (CDM)**: Core entities (Person, Group, Folder, Edge, ExternalLink)
- **Effect Schema**: Type-safe data modeling with runtime validation
- **Adapter Pattern**: ChMS integrations with Effect-based error handling
- **Sync Engine**: Bi-directional data synchronization using Temporal workflows
- **Edge-based Relationships**: Flexible entity connections

## Development Patterns

### Effect-TS Conventions (Frontend & Backend)

**Core Patterns:**

- Use `Effect.gen` for async operations instead of async/await
- Prefer `pipe` for function composition over method chaining
- Use Effect's service pattern for dependency injection
- Define tagged errors using Effect's error handling system
- Use Effect Schema for all data validation and transformation
- Leverage Effect's Layer system for service composition

**Context Tag Naming:**
Format: `@<package-name>/<path>/<TagName>`
Examples:

- `@openfaith/adapter-core/EntityManifest`
- `@openfaith/server/SessionContext`

**Frontend Specific:**

- Use Effect-RX for React state management
- Structure data fetching with Effect patterns
- Use `useRxQuery` and `useRxMutation` hooks
- All client operations should use Effect for error handling

**Backend Specific:**

- Wrap all database operations in Effect
- Use Effect's resource management for connections
- Structure services using Effect's service pattern
- Use Effect HTTP for API endpoints

### Code Style

- **Biome** for formatting and linting (primary)
- **Single quotes (`'`) for strings, not double quotes (`"`)**
- **No semicolons (`;`) at the end of lines**
- **Trailing commas required**
- **2-space indentation**
- **Use direct module imports, not relative imports**
  - Prefer: `@openfaith/server/live/httpAuthMiddlewareLive`
  - Avoid: `../live/httpAuthMiddlewareLive`
- Follow existing Effect-TS patterns

## Key Components

### Authentication

- Better Auth for authentication
- Custom RBAC system
- Session management in app layer

### Database

- PostgreSQL with Drizzle ORM
- Effect integration for all operations
- Migrations in `packages/db/migrations/`
- Schema in `packages/db/schema/`

### ChMS Adapters

- Each ChMS has dedicated adapter in `adapters/`
- PCO adapter is most mature reference
- Built with Effect for error handling
- Use Effect's Layer system for composition

### Sync Engine

- Located in `backend/workers/`
- Temporal workflows with Effect integration
- Bi-directional sync with conflict resolution
- Effect's resource management for lifecycle

### Client Sync

- Rocicorp Zero for local-first architecture
- Configuration in `packages/zero/`
- Effect-RX for reactive frontend state
- Instant UI with eventual consistency

### API Communication

- Effect HTTP and RPC (no tRPC)
- Direct Effect-based RPC calls
- Type safety through Effect Schema
- Consistent error handling across stack

## Testing

- Co-locate test files with source code
- Use Effect's testing utilities
- Test services with Effect's test runtime
- Use Effect's mock layer system
- Follow existing test patterns

## Important Notes

### Before Making Changes

1. Always run `bun run typecheck` after changes
2. Use `bun run format:fix` to fix formatting
3. Run `bun run check` for comprehensive validation
4. Database changes require `bun run db:generate`

### Common Patterns

- Use `workspace:*` for internal package references
- Wrap all async operations in Effect
- Use Effect Schema for data validation
- Follow the existing adapter patterns for new integrations
- Use Effect's error handling instead of throwing exceptions

### Infrastructure Dependencies

- PostgreSQL database must be running
- Redis for caching and sessions
- OpenTelemetry for observability
- Use `bun run infra` to start all services

This configuration ensures AI agents understand the Effect-TS first approach and can work effectively within the established patterns and architecture.
