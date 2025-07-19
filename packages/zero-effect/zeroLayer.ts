import type { Primitive } from '@effect/sql/Statement'
import { PgClient } from '@effect/sql-pg'
import { convertEffectMutatorsToPromise } from '@openfaith/zero-effect/effectMutatorConverter'
import type { CustomMutatorEfDefs } from '@openfaith/zero-effect/types'
import type { CustomMutatorDefs, ReadonlyJSONObject, Schema } from '@rocicorp/zero'
import type { DBConnection, DBTransaction, Row } from '@rocicorp/zero/pg'
import { PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg'
import { Context, Effect, Layer, Runtime } from 'effect'

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

export function zeroEffectPg<TSchema extends Schema, R = never>(
  schema: TSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<R>,
): ZQLDatabase<TSchema, PgClient.PgClient> {
  const connection = new EffectPgConnection<R>(pgClient, runtime)
  return new ZQLDatabase(connection, schema)
}

export function zeroEffectPgProcessor<TSchema extends Schema, R = never>(
  schema: TSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<R>,
): PushProcessor<ZQLDatabase<TSchema, PgClient.PgClient>, CustomMutatorDefs<TSchema>> {
  const zqlDatabase = zeroEffectPg<TSchema, R>(schema, pgClient, runtime)
  return new PushProcessor(zqlDatabase)
}

export const TypeId: unique symbol = Symbol.for('@openfaith/zero-effect/ZeroStore')

export type TypeId = typeof TypeId

export interface ZeroStore {
  readonly [TypeId]: TypeId
  readonly forSchema: <TSchema extends Schema>(schema: TSchema) => ZeroSchemaStore<TSchema>
}

export declare namespace ZeroStore {
  export type AnyStore = ZeroStore | ZeroSchemaStore<any>
}

export const ZeroSchemaStoreTypeId: unique symbol = Symbol.for(
  '@openfaith/zero-effect/ZeroSchemaStore',
)

export type ZeroSchemaStoreTypeId = typeof ZeroSchemaStoreTypeId

export interface ZeroSchemaStore<TSchema extends Schema> {
  readonly [ZeroSchemaStoreTypeId]: ZeroSchemaStoreTypeId
  readonly database: ZQLDatabase<TSchema, PgClient.PgClient>
  readonly processor: PushProcessor<
    ZQLDatabase<TSchema, PgClient.PgClient>,
    CustomMutatorDefs<TSchema>
  >
  readonly processZeroMutations: (
    mutators: CustomMutatorDefs<TSchema>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject,
  ) => Effect.Effect<any, Error>
  readonly processZeroEffectMutations: <R>(
    effectMutators: CustomMutatorEfDefs<TSchema, R>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject,
  ) => Effect.Effect<any, Error, R>
}

export const ZeroStore: Context.Tag<ZeroStore, ZeroStore> = Context.GenericTag<ZeroStore>(
  '@openfaith/zero/ZeroStore',
)

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
        return Effect.gen(function* () {
          const currentRuntime = yield* Effect.runtime<R>()
          const promiseMutators = convertEffectMutatorsToPromise<TSchema, R>(
            effectMutators,
            currentRuntime,
          )

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

export const layer = Layer.effect(
  ZeroStore,
  Effect.gen(function* () {
    const pgClient = yield* PgClient.PgClient
    const runtime = yield* Effect.runtime<never>()
    return make(pgClient, runtime)
  }),
)
