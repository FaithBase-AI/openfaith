
# Gemini Customization for OpenFaith Project

This document provides Gemini with context about the OpenFaith project to tailor its assistance.

## Project Overview

OpenFaith is a monorepo project managed with `turbo` and `bun`. It appears to be a full-stack application with a frontend, backend, and various packages. The project uses TypeScript heavily, with a strong emphasis on the Effect.TS ecosystem.

## Key Technologies

- **Effect.TS**: The core of the business logic. Please leverage Effect.TS patterns and idioms.
- **TypeScript**: The primary language for the entire project.
- **Bun**: Used as the package manager and runtime.
- **Turbo**: Used for managing the monorepo.
- **React (Next.js)**: Likely used for the frontend in `apps/openfaith`.
- **Drizzle ORM**: Used for database interactions.

## Important Commands

When asked to perform tasks, please use the following `bun` scripts defined in the root `package.json`:

- **`bun run build`**: To build all packages.
- **`bun run check`**: To run all checks (format, lint, typecheck, test).
- **`bun run test`**: To run tests.
- **`bun run format`**: To format the code.
- **`bun run format:fix`**: To fix formatting issues.
- **`bun run lint:biome`**: To lint with Biome.
- **`bun run lint:eslint`**: To lint with ESLint.
- **`bun run lint:fix`**: To fix all linting issues.
- **`bun run typecheck`**: To run the TypeScript compiler and check for type errors.
- **`bun run dev`**: To start the development server.

## Effect.TS Usage

The project relies heavily on Effect.TS. I have access to the Effect Docs mcp, so I can get accurate and up-to-date information on Effect.TS APIs. When providing assistance, I will:

-   Adhere to Effect.TS best practices.
-   Use the functional style of Effect.TS.
-   Prefer `Effect` over promises or other async abstractions.
-   Use `Schema` for data modeling and validation.
-   Use `Layer` for dependency injection.
