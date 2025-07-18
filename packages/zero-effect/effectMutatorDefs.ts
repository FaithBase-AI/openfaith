import type { CustomMutatorDefs, Schema, Transaction } from '@rocicorp/zero'
import { type Effect, Runtime } from 'effect'
import { createEffectTransaction, type EffectTransaction } from './effectTransaction'

/**
 * Effect-based version of CustomMutatorDefs
 * Mutators return Effects instead of Promises
 * R represents the requirements/dependencies that the mutators need
 */
export type CustomMutatorEfDefs<TSchema extends Schema, R = never> = {
  [TableName in keyof TSchema['tables']]?: {
    [MutatorName: string]: (
      tx: EffectTransaction<TSchema>,
      ...args: ReadonlyArray<any>
    ) => Effect.Effect<any, any, R>
  }
}

/**
 * Converts Effect-based mutators to Promise-based mutators for Zero compatibility
 * Wraps the Transaction in an EffectTransaction before passing to the mutator
 */
export function convertEffectMutatorsToPromise<TSchema extends Schema, R>(
  effectMutators: CustomMutatorEfDefs<TSchema, R>,
  runtime: Runtime.Runtime<R>,
): CustomMutatorDefs<TSchema> {
  const promiseMutators: any = {}

  for (const [tableName, tableMutators] of Object.entries(effectMutators)) {
    if (tableMutators) {
      promiseMutators[tableName] = {}

      for (const [mutatorName, mutatorFn] of Object.entries(tableMutators)) {
        if (typeof mutatorFn === 'function') {
          promiseMutators[tableName][mutatorName] = async (
            tx: Transaction<TSchema>,
            ...args: ReadonlyArray<any>
          ) => {
            // Wrap the Transaction in an EffectTransaction
            const effectTx = createEffectTransaction(tx)
            const effect = mutatorFn(effectTx, ...args)
            // Use runPromise with a default runtime context
            // Cast the effect to remove dependency constraints for runtime execution
            return await Runtime.runPromise(Runtime.defaultRuntime)(effect as any)
          }
        }
      }
    }
  }

  return promiseMutators as CustomMutatorDefs<TSchema>
}
