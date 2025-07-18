import type { Primitive } from '@effect/sql/Statement'
import { PgClient } from '@effect/sql-pg'

import type { CustomMutatorEfDefs } from '@openfaith/zero-effect/effectMutatorDefs'
import { convertEffectMutatorsToPromise } from '@openfaith/zero-effect/effectMutatorDefs'
import type { CustomMutatorDefs, ReadonlyJSONObject, Schema } from '@rocicorp/zero'
import type { DBConnection, DBTransaction, Row } from '@rocicorp/zero/pg'
import { PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg'
import { Context, Effect, Layer, Runtime } from 'effect'

/**
 * An adapter that implements the `DBConnection` interface for an `@effect/sql-pg` client.
 * This acts as a bridge between the Promise-based world of `PushProcessor` and the
 * Effect-based world of `@effect/sql`.
 */
export class EffectPgConnection<R = never> implements DBConnection<PgClient.PgClient> {
  readonly #pgClient: PgClient.PgClient
  readonly #runtime: Runtime.Runtime<R>

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<R>) {
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
    const transactionAdapter = new EffectPgTransaction<R>(this.#pgClient, this.#runtime)

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
class EffectPgTransaction<R = never> implements DBTransaction<PgClient.PgClient> {
  /**
   * Exposes the underlying `PgClient` as the "wrapped transaction".
   * This allows custom mutators to access the client if they need to perform
   * more complex operations or use specific helpers like `sql.json()`.
   */
  readonly wrappedTransaction: PgClient.PgClient
  readonly #runtime: Runtime.Runtime<R>

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<R>) {
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
export function zeroEffectPg<TSchema extends Schema, R = never>(
  schema: TSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<R>,
): ZQLDatabase<TSchema, PgClient.PgClient> {
  const connection = new EffectPgConnection<R>(pgClient, runtime)
  return new ZQLDatabase(connection, schema)
}

/**
 * A factory function that creates a `PushProcessor` instance backed by `@effect/sql-pg`.
 */
export function zeroEffectPgProcessor<TSchema extends Schema, R = never>(
  schema: TSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<R>,
): PushProcessor<ZQLDatabase<TSchema, PgClient.PgClient>, CustomMutatorDefs<TSchema>> {
  const zqlDatabase = zeroEffectPg<TSchema, R>(schema, pgClient, runtime)
  return new PushProcessor(zqlDatabase)
}

/**
 * @since 1.0.0
 * @category type id
 */
export const TypeId: unique symbol = Symbol.for('@openfaith/zero/ZeroStore')

/**
 * @since 1.0.0
 * @category type id
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ZeroStore {
  readonly [TypeId]: TypeId
  /**
   * Create a schema-specific Zero database and processor
   */
  readonly forSchema: <TSchema extends Schema>(schema: TSchema) => ZeroSchemaStore<TSchema>
}

/**
 * @since 1.0.0
 */
export declare namespace ZeroStore {
  /**
   * @since 1.0.0
   */
  export type AnyStore = ZeroStore | ZeroSchemaStore<any>
}

/**
 * @since 1.0.0
 * @category type id
 */
export const ZeroSchemaStoreTypeId: unique symbol = Symbol.for('@openfaith/zero/ZeroSchemaStore')

/**
 * @since 1.0.0
 * @category type id
 */
export type ZeroSchemaStoreTypeId = typeof ZeroSchemaStoreTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ZeroSchemaStore<TSchema extends Schema> {
  readonly [ZeroSchemaStoreTypeId]: ZeroSchemaStoreTypeId
  /**
   * The Zero database instance for this schema
   */
  readonly database: ZQLDatabase<TSchema, PgClient.PgClient>
  /**
   * The Zero push processor for this schema
   */
  readonly processor: PushProcessor<
    ZQLDatabase<TSchema, PgClient.PgClient>,
    CustomMutatorDefs<TSchema>
  >
  /**
   * Process Zero mutations using Effect patterns (Promise-based mutators)
   */
  readonly processZeroMutations: (
    mutators: CustomMutatorDefs<TSchema>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject,
  ) => Effect.Effect<any, Error>
  /**
   * Process Zero mutations using Effect-based mutators
   */
  readonly processZeroEffectMutations: <R>(
    effectMutators: CustomMutatorEfDefs<TSchema, R>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject,
  ) => Effect.Effect<any, Error, R>
}

/**
 * @since 1.0.0
 * @category tags
 */
export const ZeroStore: Context.Tag<ZeroStore, ZeroStore> = Context.GenericTag<ZeroStore>(
  '@openfaith/zero/ZeroStore',
)

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (pgClient: PgClient.PgClient, runtime: Runtime.Runtime<never>) => ZeroStore = (
  pgClient,
  runtime,
) => ({
  [TypeId]: TypeId,
  forSchema: <TSchema extends Schema>(schema: TSchema): ZeroSchemaStore<TSchema> => {
    const database = zeroEffectPg(schema, pgClient, runtime)
    const processor = zeroEffectPgProcessor(schema, pgClient, runtime)

    return {
      [ZeroSchemaStoreTypeId]: ZeroSchemaStoreTypeId,
      database,
      processor,
      processZeroEffectMutations: <R>(
        effectMutators: CustomMutatorEfDefs<TSchema, R>,
        urlParams: Record<string, string>,
        payload: ReadonlyJSONObject,
      ): Effect.Effect<any, Error, R> => {
        // Get the current runtime and convert Effect-based mutators to Promise-based mutators
        return Effect.gen(function* () {
          const currentRuntime = yield* Effect.runtime<R>()
          const promiseMutators = convertEffectMutatorsToPromise(effectMutators, currentRuntime)

          // Process using the converted mutators - processor.process already returns a Promise
          return yield* Effect.tryPromise({
            catch: (error) => new Error(`Zero Effect mutation processing failed: ${error}`),
            try: () => processor.process(promiseMutators, urlParams, payload),
          })
        })
      },
      processZeroMutations: (mutators, urlParams, payload) =>
        Effect.tryPromise({
          catch: (error) => new Error(`Zero mutation processing failed: ${error}`),
          try: () => processor.process(mutators, urlParams, payload),
        }),
    }
  },
})

/**
 * @since 1.0.0
 * @category layers
 */
export const layer = Layer.effect(
  ZeroStore,
  Effect.gen(function* () {
    const pgClient = yield* PgClient.PgClient
    const runtime = yield* Effect.runtime<never>()
    return make(pgClient, runtime)
  }),
)
