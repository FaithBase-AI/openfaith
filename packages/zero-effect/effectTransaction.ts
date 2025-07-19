import { ZeroMutatorDatabaseError } from '@openfaith/zero-effect/types'
import type { Schema, Transaction } from '@rocicorp/zero'
import { Effect } from 'effect'

export class EffectTransaction<TSchema extends Schema> {
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

export const createEffectTransaction = <TSchema extends Schema>(tx: Transaction<TSchema>) =>
  new EffectTransaction(tx)
