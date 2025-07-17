import type { Primitive } from '@effect/sql/Statement'
import { PgClient } from '@effect/sql-pg'
import type { CustomMutatorDefs, ReadonlyJSONObject } from '@rocicorp/zero'
import type { DBConnection, DBTransaction, Row } from '@rocicorp/zero/pg'
import { PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg'
import { Effect, Runtime } from 'effect'
import type { ZSchema } from './zeroSchema.mjs'

/**
 * An adapter that implements the `DBConnection` interface for an `@effect/sql-pg` client.
 * This acts as a bridge between the Promise-based world of `PushProcessor` and the
 * Effect-based world of `@effect/sql`.
 */
export class EffectPgConnection implements DBConnection<PgClient.PgClient> {
  readonly #pgClient: PgClient.PgClient
  readonly #runtime: Runtime.Runtime<never>

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<never>) {
    this.#pgClient = pgClient
    this.#runtime = runtime
  }

  /**
   * Implements the transaction logic. It uses the `PgClient.withTransaction`
   * method to ensure that all operations within the callback run in a single,
   * managed database transaction.
   */
  transaction<TRet>(fn: (tx: DBTransaction<PgClient.PgClient>) => Promise<TRet>): Promise<TRet> {
    // Create an instance of our DBTransaction adapter.
    const transactionAdapter = new EffectPgTransaction(this.#pgClient, this.#runtime)

    // Create an Effect that will execute the user's promise-based callback.
    // Effect.promise() converts the Promise into an Effect.
    const effectToRun = Effect.promise(() => fn(transactionAdapter))

    // Wrap the Effect in `withTransaction`. This ensures that any `sql` query
    // made by the `transactionAdapter` within the callback will use the
    // transactional connection.
    const transactionalEffect = this.#pgClient.withTransaction(effectToRun)

    // Execute the entire transactional Effect and return the resulting Promise.
    return Runtime.runPromise(this.#runtime)(transactionalEffect)
  }
}

/**
 * An adapter that implements the `DBTransaction` interface. An instance of this
 * class is passed to the transaction callback.
 */
class EffectPgTransaction implements DBTransaction<PgClient.PgClient> {
  /**
   * Exposes the underlying `PgClient` as the "wrapped transaction".
   * This allows custom mutators to access the client if they need to perform
   * more complex operations or use specific helpers like `sql.json()`.
   */
  readonly wrappedTransaction: PgClient.PgClient
  readonly #runtime: Runtime.Runtime<never>

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<never>) {
    this.wrappedTransaction = pgClient
    this.#runtime = runtime
  }

  /**
   * Executes a raw SQL query.
   * Because this method is only ever called from within the `withTransaction`
   * block created by `EffectPgConnection`, any query here will automatically
   * be part of the active transaction.
   */
  query(sql: string, params: Array<unknown>): Promise<Iterable<Row>> {
    const queryEffect = this.wrappedTransaction.unsafe(sql, params as Array<Primitive>)
    return Runtime.runPromise(this.#runtime)(queryEffect) as Promise<Iterable<Row>>
  }
}

/**
 * A factory function that creates a `ZQLDatabase` instance backed by `@effect/sql-pg`.
 * This is the main entry point for using the adapter.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Runtime } from "effect"
 * import { PgClient } from "@effect/sql-pg"
 * import { zeroEffectPg } from './effectPgAdapter'
 * import type { ZSchema } from './zeroSchema.mjs'
 *
 * // In your main application setup
 * const ZeroProcessorLive = Layer.effect(
 *   ZeroProcessor,
 *   Effect.gen(function*() {
 *     const pgClient = yield* PgClient.PgClient
 *     const runtime = yield* Effect.runtime<never>()
 *     return zeroEffectPg(pgClient, runtime)
 *   })
 * )
 * ```
 */
export function zeroEffectPg(
  schema: ZSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<never>,
) {
  const connection = new EffectPgConnection(pgClient, runtime)
  return new ZQLDatabase(connection, schema)
}

/**
 * A factory function that creates a `PushProcessor` instance backed by `@effect/sql-pg`.
 */
export function zeroEffectPgProcessor(
  schema: ZSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<never>,
) {
  const zqlDatabase = zeroEffectPg(schema, pgClient, runtime)
  return new PushProcessor(zqlDatabase)
}

/**
 * Service tag for the Zero ZQLDatabase
 */
export class ZeroDatabase extends Effect.Service<ZeroDatabase>()('@openfaith/zero/ZeroDatabase', {
  effect: Effect.gen(function* () {
    const pgClient = yield* PgClient.PgClient
    const runtime = yield* Effect.runtime<never>()
    // Note: You'll need to provide the schema from your application context
    // This is just a placeholder - replace with your actual schema
    const schema = {} as ZSchema
    return zeroEffectPg(schema, pgClient, runtime)
  }),
}) {}

/**
 * Service tag for the Zero PushProcessor
 */
export class ZeroProcessor extends Effect.Service<ZeroProcessor>()(
  '@openfaith/zero/ZeroProcessor',
  {
    effect: Effect.gen(function* () {
      const pgClient = yield* PgClient.PgClient
      const runtime = yield* Effect.runtime<never>()
      // Note: You'll need to provide the schema from your application context
      // This is just a placeholder - replace with your actual schema
      const schema = {} as ZSchema
      return zeroEffectPgProcessor(schema, pgClient, runtime)
    }),
  },
) {}

/**
 * Helper function to process Zero mutations using Effect patterns
 */
export const processZeroMutations = (
  mutators: CustomMutatorDefs<any>,
  urlParams: Record<string, string>,
  payload: ReadonlyJSONObject,
) =>
  Effect.gen(function* () {
    const processor = yield* ZeroProcessor
    return yield* Effect.tryPromise({
      catch: (error) => new Error(`Zero mutation processing failed: ${error}`),
      try: () => processor.process(mutators, urlParams, payload),
    })
  })
