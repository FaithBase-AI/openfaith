/**
 * @since 1.0.0
 */
import type { CustomMutatorDefs, Transaction, Schema as ZeroSchema } from '@rocicorp/zero'
import { Effect, Runtime, Schema } from 'effect'

/**
 * @since 1.0.0
 * @category models
 */
export type CustomMutatorEfDefs<TSchema extends ZeroSchema, R = never> = {
  [TableName in keyof TSchema['tables']]?: {
    [MutatorName: string]: (
      tx: EffectTransaction<TSchema>,
      ...args: ReadonlyArray<any>
    ) => Effect.Effect<any, any, R>
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export class ZeroMutatorAuthError extends Schema.TaggedError<ZeroMutatorAuthError>()(
  'ZeroMutatorAuthError',
  {
    message: Schema.String,
  },
) {}

/**
 * @since 1.0.0
 * @category models
 */
export class ZeroMutatorValidationError extends Schema.TaggedError<ZeroMutatorValidationError>()(
  'ZeroMutatorValidationError',
  {
    field: Schema.String.pipe(Schema.optional),
    message: Schema.String,
  },
) {}

/**
 * @since 1.0.0
 * @category models
 */
export class ZeroMutatorDatabaseError extends Schema.TaggedError<ZeroMutatorDatabaseError>()(
  'ZeroMutatorDatabaseError',
  {
    cause: Schema.Unknown.pipe(Schema.optional),
    message: Schema.String,
  },
) {}

/**
 * @since 1.0.0
 * @category models
 */
export class ZeroMutationProcessingError extends Schema.TaggedError<ZeroMutationProcessingError>()(
  'ZeroMutationProcessingError',
  {
    cause: Schema.Unknown.pipe(Schema.optional),
    message: Schema.String,
  },
) {}

/**
 * @since 1.0.0
 * @category models
 * @example
 * ```ts
 * const updatePerson = (tx: EffectTransaction<Schema>, input: UpdateInput) =>
 *   Effect.gen(function* () {
 *     // Mutations return Effects that can fail with ZeroMutatorDatabaseError
 *     yield* tx.mutate.people.update({ id: input.id, name: input.name })
 *
 *     // Queries also return Effects
 *     const person = yield* tx.query.people.where('id', input.id).first()
 *
 *     return person
 *   })
 * ```
 */
export class EffectTransaction<TSchema extends ZeroSchema> {
  constructor(private tx: Transaction<TSchema>) {}

  get mutate() {
    return this.createMutateProxy(this.tx.mutate)
  }

  get query() {
    return this.createQueryProxy(this.tx.query)
  }

  private createMutateProxy(mutate: any): any {
    return new Proxy(mutate, {
      get: (target, prop) => {
        const value = target[prop]
        if (typeof value === 'object' && value !== null) {
          return this.createMutateProxy(value)
        }
        if (typeof value === 'function') {
          return (...args: Array<any>) =>
            Effect.tryPromise({
              catch: (error) =>
                new ZeroMutatorDatabaseError({
                  cause: error,
                  message: `Database mutation failed: ${String(error)}`,
                }),
              try: () => value.apply(target, args),
            })
        }
        return value
      },
    })
  }

  private createQueryProxy(query: any): any {
    return new Proxy(query, {
      get: (target, prop) => {
        const value = target[prop]
        if (typeof value === 'object' && value !== null) {
          return this.createQueryProxy(value)
        }
        if (typeof value === 'function') {
          return (...args: Array<any>) =>
            Effect.tryPromise({
              catch: (error) =>
                new ZeroMutatorDatabaseError({
                  cause: error,
                  message: `Database query failed: ${String(error)}`,
                }),
              try: () => value.apply(target, args),
            })
        }
        return value
      },
    })
  }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const createEffectTransaction = <TSchema extends ZeroSchema>(tx: Transaction<TSchema>) =>
  new EffectTransaction(tx)

/**
 * @since 1.0.0
 * @category models
 */
type EffectMutators<_TSchema extends ZeroSchema, R> = Record<
  string,
  Record<string, (tx: any, ...args: Array<any>) => Effect.Effect<any, any, R>> | undefined
>

/**
 * @since 1.0.0
 * @category converters
 * @example
 * ```ts
 * // Client usage
 * const clientMutators = convertEffectMutatorsToPromise(
 *   effectMutators,
 *   Runtime.defaultRuntime
 * )
 *
 * // Server usage with custom runtime
 * const serverRuntime = Runtime.defaultRuntime.pipe(
 *   Runtime.provideService(MyService, myServiceImpl)
 * )
 * const serverMutators = convertEffectMutatorsToPromise(
 *   effectMutators,
 *   serverRuntime
 * )
 * ``` */
export function convertEffectMutatorsToPromise<TSchema extends ZeroSchema, R>(
  effectMutators: EffectMutators<TSchema, R>,
  runtime: Runtime.Runtime<R>,
): CustomMutatorDefs<TSchema> {
  const promiseMutators: any = {}

  for (const [tableName, tableMutators] of Object.entries(effectMutators as Record<string, any>)) {
    if (tableMutators) {
      promiseMutators[tableName] = {}

      for (const [mutatorName, mutatorFn] of Object.entries(tableMutators)) {
        if (typeof mutatorFn === 'function') {
          promiseMutators[tableName][mutatorName] = async (
            tx: Transaction<TSchema>,
            ...args: ReadonlyArray<any>
          ) => {
            const effectTx = createEffectTransaction(tx)
            const effect = mutatorFn(effectTx, ...args).pipe(Effect.tapError(Effect.log))
            return await Runtime.runPromise(runtime)(effect)
          }
        }
      }
    }
  }

  return promiseMutators as CustomMutatorDefs<TSchema>
}
