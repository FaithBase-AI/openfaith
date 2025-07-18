import { PgClient } from '@effect/sql-pg'
import { schema } from '@openfaith/zero'
import { ZeroProcessor, zeroEffectPgProcessor } from '@openfaith/zero/layers/zeroLayer'
import { Effect, Layer } from 'effect'

// export const ZeroSchemaLive = Effect.provideService(ZeroSchema, schema)

/**
 * Live implementation of ZeroProcessor service
 * Requires ZeroSchema and PgClient to be provided
 */
export const ZeroProcessorLive = Layer.effect(
  ZeroProcessor,
  Effect.gen(function* () {
    const pgClient = yield* PgClient.PgClient
    const runtime = yield* Effect.runtime<never>()
    return zeroEffectPgProcessor(schema, pgClient, runtime)
  }),
)

/**
 * Combined layer that provides both ZeroDatabase and ZeroProcessor
 */
export const ZeroLive = ZeroProcessorLive
