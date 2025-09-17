# @openfaith/sql-pg-bun

A Bun-native PostgreSQL client for Effect-TS, providing a drop-in replacement for `@effect/sql-pg` using Bun's native SQL driver.

## Features

- **Bun Native**: Uses Bun's optimized PostgreSQL driver instead of postgres.js
- **Effect-TS First**: Built with Effect patterns throughout
- **API Compatible**: Drop-in replacement for `@effect/sql-pg` 
- **Full SQL Support**: All SQL helpers (insert, update, json, array, etc.)
- **Type Safe**: Complete TypeScript support with Effect Schema integration
- **Performance**: Leverages Bun's faster native database connectivity

## Installation

```bash
bun add @openfaith/sql-pg-bun
```

## Usage

### Basic Setup

```typescript
import { PgClient } from "@openfaith/sql-pg-bun"
import { Effect, Layer } from "effect"

// Create a client layer
const SqlLive = PgClient.layer({
  hostname: "localhost", 
  port: 5432,
  database: "myapp",
  username: "user",
  password: "pass"
})

// Or use a connection URL
const SqlLive = PgClient.layer({
  url: "postgres://user:pass@localhost:5432/myapp"
})
```

### SQL Queries

```typescript
const program = Effect.gen(function*() {
  const sql = yield* PgClient.PgClient
  
  // Simple query
  const users = yield* sql`SELECT * FROM users`
  
  // Parameterized query  
  const user = yield* sql`SELECT * FROM users WHERE id = ${userId}`
  
  // Insert helper
  yield* sql`INSERT INTO users ${sql.insert({ name: "John", email: "john@example.com" })}`
  
  // JSON support
  yield* sql`SELECT ${sql.json({ preferences: ["dark", "large"] })} as config`
})
```

### Advanced Features

```typescript
// Field transformations (camelCase ↔ snake_case)
const SqlLive = PgClient.layer({
  url: connectionUrl,
  transformResultNames: String.snakeToCamel,
  transformQueryNames: String.camelToSnake
})

// Listen/Notify (PostgreSQL pub/sub)
const notifications = sql.listen("channel_name")

yield* sql.notify("channel_name", "Hello World!")
```

## Differences from @effect/sql-pg

- **Connection**: Uses Bun's `SQL` constructor instead of postgres.js
- **Performance**: Native Bun driver should be faster
- **Dependencies**: No external postgres.js dependency  
- **Streaming**: Simplified streaming implementation (Bun SQL doesn't have cursors)
- **Listen/Notify**: Simplified polling-based implementation

## Compatibility

This package maintains 100% API compatibility with `@effect/sql-pg`. You can replace:

```typescript
// Before
import { PgClient } from "@effect/sql-pg" 

// After  
import { PgClient } from "@openfaith/sql-pg-bun"
```

All existing code should work unchanged.

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | PostgreSQL connection URL |
| `hostname` | `string` | Database host (default: localhost) |
| `port` | `number` | Database port (default: 5432) |
| `database` | `string` | Database name |
| `username` | `string` | Username for authentication |
| `password` | `string` | Password for authentication |
| `ssl` | `boolean` | Enable SSL connection |
| `maxConnections` | `number` | Max connections in pool (default: 10) |
| `transformResultNames` | `function` | Transform result field names |
| `transformQueryNames` | `function` | Transform query field names |

## Migration from @effect/sql-pg

1. Replace the import:
   ```typescript
   - import { PgClient } from "@effect/sql-pg"
   + import { PgClient } from "@openfaith/sql-pg-bun"
   ```

2. Update connection configuration if using postgres.js specific options:
   ```typescript
   // Old postgres.js options  
   const config = {
     host: "localhost",     // ← Change to 'hostname'
     user: "myuser",        // ← Change to 'username'  
     prepare: false,        // ← Remove (not supported)
   }
   
   // New Bun SQL options
   const config = {
     hostname: "localhost", 
     username: "myuser",
   }
   ```

3. That's it! All queries and Effect patterns remain the same.

## Testing

Tests use the same patterns as the original Effect SQL tests, adapted for the OpenFaith testing framework:

```bash
bun test
```

## Contributing

This package follows the OpenFaith development patterns:

- **Effect-first**: All operations use Effect patterns
- **No async/await**: Use `Effect.gen` for async operations  
- **Biome formatting**: Run `bun run format --write`
- **Type safety**: No `any` types allowed

## License

MIT