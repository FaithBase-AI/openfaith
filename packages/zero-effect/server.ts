/**
 * @since 1.0.0
 */
import type { Primitive } from '@effect/sql/Statement'
import { PgClient } from '@effect/sql-pg'
import {
  type CustomMutatorEfDefs,
  convertEffectMutatorsToPromise,
  ZeroMutationProcessingError,
} from '@openfaith/zero-effect/client'
import type { CustomMutatorDefs, ReadonlyJSONObject, Schema } from '@rocicorp/zero'
import type { DBConnection, DBTransaction, Row } from '@rocicorp/zero/pg'
import { PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg'
import { Context, Effect, Layer, Runtime } from 'effect'

export * from '@openfaith/zero-effect/client'

/**
 * @since 1.0.0
 * @category models
 */
export class EffectPgConnection<R = never> implements DBConnection<PgClient.PgClient> {
  readonly #pgClient: PgClient.PgClient
  readonly #runtime: Runtime.Runtime<R>

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<R>) {
    this.#pgClient = pgClient
    this.#runtime = runtime
  }

  transaction<TRet>(fn: (tx: DBTransaction<PgClient.PgClient>) => Promise<TRet>): Promise<TRet> {
    const transactionAdapter = new EffectPgTransaction<R>(this.#pgClient, this.#runtime)

    const effectToRun = Effect.promise(() => fn(transactionAdapter))

    const transactionalEffect = this.#pgClient.withTransaction(effectToRun)

    return Runtime.runPromise(this.#runtime)(transactionalEffect)
  }
}

/**
 * @since 1.0.0
 * @category models
 */
class EffectPgTransaction<R = never> implements DBTransaction<PgClient.PgClient> {
  readonly wrappedTransaction: PgClient.PgClient
  readonly #runtime: Runtime.Runtime<R>

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<R>) {
    this.wrappedTransaction = pgClient
    this.#runtime = runtime
  }

  query(sql: string, params: Array<unknown>): Promise<Iterable<Row>> {
    const queryEffect = this.wrappedTransaction.unsafe(sql, params as Array<Primitive>)
    return Runtime.runPromise(this.#runtime)(queryEffect) as Promise<Iterable<Row>>
  }
}

/**
 * @since 1.0.0
 * @category constructors
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
 * @since 1.0.0
 * @category constructors
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
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for('@openfaith/zero-effect/ZeroStore')

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 * @example
 * ```ts
 * const handler = Effect.gen(function* () {
 *   const zeroStore = yield* ZeroStore
 *   const schemaStore = zeroStore.forSchema(mySchema)
 *
 *   // Process mutations from Zero client
 *   const result = yield* schemaStore.processMutations(
 *     myMutators,
 *     urlParams,
 *     payload
 *   )
 *
 *   return result
 * })
 * ``` */
export interface ZeroStore {
  readonly [TypeId]: TypeId
  readonly forSchema: <TSchema extends Schema>(schema: TSchema) => ZeroSchemaStore<TSchema>
}

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace ZeroStore {
  export type AnyStore = ZeroStore | ZeroSchemaStore<any>
}

/**
 * @since 1.0.0
 * @category symbols
 */
export const ZeroSchemaStoreTypeId: unique symbol = Symbol.for(
  '@openfaith/zero-effect/ZeroSchemaStore',
)

/**
 * @since 1.0.0
 * @category symbols
 */
export type ZeroSchemaStoreTypeId = typeof ZeroSchemaStoreTypeId

/**
 * @since 1.0.0
 * @category models
 * @example
 * ```ts
 * const schemaStore = zeroStore.forSchema(mySchema)
 *
 * // Process mutations
 * const result = yield* schemaStore.processMutations(
 *   myMutators,
 *   urlParams,
 *   mutationPayload
 * )
 * ``` */
export interface ZeroSchemaStore<TSchema extends Schema> {
  readonly [ZeroSchemaStoreTypeId]: ZeroSchemaStoreTypeId
  readonly database: ZQLDatabase<TSchema, PgClient.PgClient>
  readonly processor: PushProcessor<
    ZQLDatabase<TSchema, PgClient.PgClient>,
    CustomMutatorDefs<TSchema>
  >
  readonly processMutations: <R>(
    effectMutators: CustomMutatorEfDefs<TSchema, R>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject,
  ) => Effect.Effect<any, ZeroMutationProcessingError, R>
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
      processMutations: <R>(
        effectMutators: CustomMutatorEfDefs<TSchema, R>,
        urlParams: Record<string, string>,
        payload: ReadonlyJSONObject,
      ): Effect.Effect<any, ZeroMutationProcessingError, R> => {
        return Effect.gen(function* () {
          const currentRuntime = yield* Effect.runtime<R>()
          const promiseMutators = convertEffectMutatorsToPromise<TSchema, R>(
            effectMutators,
            currentRuntime,
          )

          return yield* Effect.tryPromise({
            catch: (error) =>
              new ZeroMutationProcessingError({
                cause: error,
                message: `Zero mutation processing failed: ${String(error)}`,
              }),
            try: () => processor.process(promiseMutators, urlParams, payload),
          })
        })
      },
      processor,
    }
  },
})

/**
 * @since 1.0.0
 * @category layers
 */
export const ZeroStoreLive = Layer.effect(
  ZeroStore,
  Effect.gen(function* () {
    const pgClient = yield* PgClient.PgClient
    const runtime = yield* Effect.runtime<never>()
    return make(pgClient, runtime)
  }),
)
