# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `bun run dev`: Start development servers (frontend + backend + infrastructure)
- `bun run build`: Build all packages for production
- `bun run typecheck`: Run TypeScript checks across all packages
- `bun run check`: Run comprehensive quality checks (format, lint, typecheck, test)
- `bun run test`: Run tests across all packages

### Code Quality & Formatting

- `bun run format`: Check code formatting with Biome
- `bun run format:fix`: Fix code formatting issues automatically
- `bun run lint:biome`: Run Biome linter
- `bun run lint:biome:fix`: Fix Biome linting issues (with --unsafe flag)
- `bun run lint:eslint`: Run ESLint (with caching)
- `bun run lint:eslint:fix`: Fix ESLint issues automatically

### Database Operations

- `bun run db:generate`: Generate database types from schema
- `bun run db:migrate`: Run database migrations
- `bun run infra`: Start infrastructure services (databases, Redis, etc.)

### Infrastructure

- `bun run clean`: Clean all generated files and caches
- `bun run clean:workspaces`: Clean all workspace packages

## Project Architecture

### Monorepo Structure

This is a **Turborepo monorepo** using **Bun** as the package manager. The project follows a modular architecture with clear separation of concerns:

#### Core Directories

- **`apps/`**: Main applications (frontend app in `apps/openfaith/`)
- **`packages/`**: Shared libraries and utilities
- **`backend/`**: Server-side services (API, workers, shard manager)
- **`adapters/`**: ChMS integration adapters (PCO, CCB, etc.)
- **`infra/`**: Infrastructure services (database, Redis, OpenTelemetry)

#### Key Packages

- **`packages/db/`**: Database schema, migrations, and Drizzle ORM configuration
- **`packages/schema/`**: Effect Schema definitions for the Canonical Data Model
- **`packages/ui/`**: Shared UI components and design system
- **`packages/auth/`**: Authentication utilities (Better Auth)
- **`packages/zero/`**: Client-side sync using Rocicorp Zero
- **`packages/shared/`**: Common utilities and types

### Technology Stack

**Core Philosophy: Effect-TS First**
This project is built around the Effect-TS ecosystem across the entire stack, which provides functional programming patterns for TypeScript with excellent error handling, async operations, and dependency injection.

- **Frontend**: React with **Effect-TS ecosystem**, Tanstack Router, Vite, TailwindCSS
- **Backend**: **Effect-TS ecosystem** with Effect HTTP and RPC
- **Database**: PostgreSQL with Drizzle ORM (integrated with Effect)
- **Auth**: Better Auth for authentication
- **Client Sync**: Rocicorp Zero for local-first data sync
- **ChMS Integration**: Custom adapter pattern using Effect for external APIs
- **Workflow Engine**: Temporal for durable workflows
- **Monorepo**: Turborepo with Bun package manager

### Data Architecture

OpenFaith uses a **Canonical Data Model (CDM)** approach:

- Core entities: Person, Group, Folder, Edge (relationships), ExternalLink
- **Effect Schema** for type-safe data modeling with AI-first design
- **Adapter Pattern** for ChMS integrations (Planning Center, CCB, etc.)
- **Sync Engine** for bi-directional data synchronization
- **Edge-based relationships** for flexible entity connections

### Development Patterns

**Effect-TS Patterns & Best Practices (Frontend & Backend):**

- **Effect for Async Operations**: Use `Effect.gen` for async/await-like syntax with better error handling
- **Layer System**: Use Effect's dependency injection system for service composition across the stack
- **Schema First**: Define Effect Schemas for all data structures with runtime validation
- **Error Handling**: Use Effect's tagged errors instead of throwing exceptions
- **Service Pattern**: Create services using Effect's service pattern for dependency injection
- **Resource Management**: Use Effect's resource management for cleanup and lifecycle
- **Pipe Operations**: Use Effect's pipe for composing operations functionally
- **React Integration**: Use Effect-RX for reactive state management in React components
- **Client-Side Services**: Structure frontend services using Effect's service pattern

**General Patterns:**

- **Type Safety**: Heavy use of TypeScript and Effect Schema for runtime validation
- **Workspace Dependencies**: Use `workspace:*` for internal package references
- **Biome**: Code formatting and linting (configured in `biome.json`)
- **Turborepo**: Build orchestration and caching

## Important Notes

### Code Style & Effect-TS Conventions

**Effect-TS Specific (Frontend & Backend):**

- Use `Effect.gen` for async operations instead of async/await
- Prefer `pipe` for function composition over method chaining
- Use Effect's service pattern for dependency injection across the stack
- Define tagged errors using Effect's error handling system
- Use Effect Schema for all data validation and transformation
- Leverage Effect's Layer system for service composition
- Use Effect-RX for React state management instead of traditional state libraries
- Structure all frontend data fetching and mutations using Effect patterns

**Context Tag Naming Convention:**

- Use the format: `@<package-name>/<path>/<TagName>`
- Examples: `@openfaith/adapter-core/EntityManifest`, `@openfaith/server/SessionContext`
- The tag name should match the package path and the tag class name

**General Style:**

- Use **Biome** for formatting and linting (not Prettier/ESLint primarily)
- Follow the existing patterns in Effect-TS ecosystem
- Use single quotes for strings (`'` not `"`)
- Trailing commas are required
- 2-space indentation

### Database & Effect Integration

- Use Drizzle ORM for all database operations (integrated with Effect)
- Database operations should be wrapped in Effect for error handling
- Migrations are in `packages/db/migrations/`
- Schema definitions are in `packages/db/schema/`
- Database health checks are required before starting services
- Use Effect's resource management for database connections

### Authentication

- Better Auth is used for authentication
- Custom RBAC system for authorization
- Session management is handled in the app layer

### Testing with Effect

- Run tests with `bun run test`
- Test files should be co-located with source code
- Use Effect's testing utilities for testing async operations
- Test Effect services using Effect's test runtime
- Use Effect's mock layer system for testing dependencies
- Use the existing test patterns in the codebase

### ChMS Adapters & Effect Integration

- Each ChMS has its own adapter in `adapters/` directory
- PCO (Planning Center) adapter is the most mature
- Adapters are built using Effect for error handling and async operations
- All API calls should be wrapped in Effect for proper error handling
- Use Effect's Layer system for adapter service composition
- Authentication and token management use Effect's resource management
- Follow the existing adapter patterns when adding new integrations

### Sync Engine & Effect Workflows

- Located in `backend/workers/`
- Uses Temporal for durable workflows with Effect integration
- All workflow operations built using Effect patterns
- Handles bi-directional sync between OpenFaith and external systems
- Implements conflict resolution and state management using Effect's error handling
- Use Effect's resource management for workflow lifecycle

### Client Sync & Frontend Effect Integration

- Uses Rocicorp Zero for local-first architecture
- Configuration in `packages/zero/`
- Provides instant UI updates with eventual consistency
- Frontend data layer built with Effect patterns for consistent error handling
- Use Effect-RX for reactive state management in React components
- All client-side data operations should use Effect for predictable error handling

### API Layer & RPC Communication

- **Backend API**: Uses `/backend/server` with Effect HTTP and RPC (no tRPC)
- **Frontend Integration**: Managed through `apps/openfaith/shared/hooks/rxHooks.ts`
- **RPC Pattern**: Direct Effect-based RPC calls without tRPC middleware
- **State Management**: Effect-RX hooks (`useRxQuery`, `useRxMutation`) for frontend state
- **Type Safety**: Maintained through Effect Schema across client-server boundary
- **Error Handling**: Consistent Effect error handling from backend to frontend
