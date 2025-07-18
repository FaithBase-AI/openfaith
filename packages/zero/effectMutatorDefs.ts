import type { CustomMutatorDefs, Schema } from '@rocicorp/zero'
import { type Effect, Runtime } from 'effect'

/**
 * Effect-based version of CustomMutatorDefs where mutators return Effects instead of Promises
 */
export type CustomMutatorEfDefs<TSchema extends Schema> = {
  readonly [TableName in keyof TSchema['tables']]?: {
    readonly [MutatorName: string]: (
      ...args: ReadonlyArray<any>
    ) => Effect.Effect<void, unknown, never>
  }
}

/**
 * Converts Effect-based mutators to Promise-based mutators for Zero compatibility
 */
export function convertEffectMutatorsToPromise<TSchema extends Schema>(
  effectMutators: CustomMutatorEfDefs<TSchema>,
  runtime: Runtime.Runtime<never>,
): CustomMutatorDefs<TSchema> {
  const promiseMutators: any = {}

  for (const [tableName, tableMutators] of Object.entries(effectMutators)) {
    if (tableMutators) {
      promiseMutators[tableName] = {}

      for (const [mutatorName, mutatorFn] of Object.entries(tableMutators)) {
        if (typeof mutatorFn === 'function') {
          promiseMutators[tableName][mutatorName] = (...args: ReadonlyArray<any>) => {
            const effect = mutatorFn(...args)
            return Runtime.runPromise(runtime)(effect)
          }
        }
      }
    }
  }

  return promiseMutators as CustomMutatorDefs<TSchema>
}
