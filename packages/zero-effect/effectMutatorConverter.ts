import { createEffectTransaction } from '@openfaith/zero-effect/effectTransaction'
import type { CustomMutatorDefs, Schema, Transaction } from '@rocicorp/zero'
import { type Effect, Runtime } from 'effect'

// Type for Effect-based mutators that preserves the dependency information
type EffectMutators<_TSchema extends Schema, R> = Record<
  string,
  Record<string, (tx: any, ...args: Array<any>) => Effect.Effect<any, any, R>> | undefined
>

export function convertEffectMutatorsToPromise<TSchema extends Schema, R>(
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
            const effect = mutatorFn(effectTx, ...args)
            return await Runtime.runPromise(runtime)(effect)
          }
        }
      }
    }
  }

  return promiseMutators as CustomMutatorDefs<TSchema>
}
