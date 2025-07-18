import type { Primitive } from '@effect/sql/Statement'
import type { PgClient } from '@effect/sql-pg'
import type { ZSchema } from '@openfaith/zero/zeroSchema.mjs'
import type { CustomMutatorDefs, ReadonlyJSONObject } from '@rocicorp/zero'
import type { DBConnection, DBTransaction, Row } from '@rocicorp/zero/pg'
import { PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg'
import { Context, Effect, Runtime } from 'effect'

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
 */
export function zeroEffectPg(
  schema: ZSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<never>,
): ZQLDatabase<ZSchema, PgClient.PgClient> {
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
): PushProcessor<ZQLDatabase<ZSchema, PgClient.PgClient>, CustomMutatorDefs<ZSchema>> {
  const zqlDatabase = zeroEffectPg(schema, pgClient, runtime)
  return new PushProcessor(zqlDatabase)
}

/**
 * Context tag for the Zero schema configuration
 */
export class ZeroSchema extends Context.Tag('@openfaith/zero/ZeroSchema')<ZeroSchema, ZSchema>() {}

/**
 * Service interface for Zero database operations
 */
export class ZeroDatabase extends Context.Tag('@openfaith/zero/ZeroDatabase')<
  ZeroDatabase,
  ZQLDatabase<ZSchema, PgClient.PgClient>
>() {}

/**
 * Service interface for Zero push processor operations
 */
export class ZeroProcessor extends Context.Tag('@openfaith/zero/ZeroProcessor')<
  ZeroProcessor,
  PushProcessor<ZQLDatabase<ZSchema, PgClient.PgClient>, CustomMutatorDefs<ZSchema>>
>() {}

/**
 * Helper function to process Zero mutations using Effect patterns
 */
export const processZeroMutations = (
  mutators: CustomMutatorDefs<ZSchema>,
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
