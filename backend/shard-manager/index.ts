#!/usr/bin/env node

import { BunClusterShardManagerSocket, BunRuntime } from '@effect/platform-bun'
import { PgLive } from '@openfaith/db'
import { Layer, Logger } from 'effect'

// Development configuration - uses shared environment
// const SHARD_MANAGER_CONFIG = {
//   database: {
//     database: env.DB_NAME,
//     host: env.DB_HOST_PRIMARY,
//     password: env.DB_PASSWORD,
//     port: env.DB_PORT,
//     username: env.DB_USERNAME,
//   },
//   logLevel: process.env.LOG_LEVEL || 'info',
// }

BunClusterShardManagerSocket.layer({
  storage: 'sql',
}).pipe(Layer.provide(PgLive), Layer.provide(Logger.pretty), Layer.launch, BunRuntime.runMain)

// // Shard Manager program
// const program = Effect.gen(function* () {
//   yield* Effect.log('🚀 Starting Effect Cluster Shard Manager...')
//   yield* Effect.log(`📋 Configuration:`)
//   yield* Effect.log(
//     `   - Database: ${SHARD_MANAGER_CONFIG.database.host}:${SHARD_MANAGER_CONFIG.database.port}/${SHARD_MANAGER_CONFIG.database.database}`,
//   )
//   yield* Effect.log(`   - Log Level: ${SHARD_MANAGER_CONFIG.logLevel}`)

//   // Start the shard manager layer
//   yield* BunClusterShardManagerSocket.layer({
//     storage: 'sql',
//   }).pipe(Layer.provide(PgLive), Layer.launch)

//   yield* Effect.log('✅ Shard Manager is running and coordinating workflow runners')
//   yield* Effect.log('ℹ️  Press Ctrl+C to stop')

//   // Keep running
//   return yield* Effect.never
// }).pipe(
//   Effect.provide(Logger.pretty),
//   Effect.catchAll((error) =>
//     Effect.gen(function* () {
//       yield* Effect.logError(`💥 Shard Manager failed to start: ${error}`)
//       yield* Effect.logError('🔍 Make sure PostgreSQL is running and accessible')
//       return Effect.fail(error)
//     }),
//   ),
// )

// // Start the shard manager
// BunRuntime.runMain(program)
