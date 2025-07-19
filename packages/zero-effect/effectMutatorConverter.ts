import { createEffectTransaction } from '@openfaith/zero-effect/effectTransaction'
import type { CustomMutatorEfDefs } from '@openfaith/zero-effect/types'
import type { CustomMutatorDefs, Schema, Transaction } from '@rocicorp/zero'
import { Runtime } from 'effect'

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
