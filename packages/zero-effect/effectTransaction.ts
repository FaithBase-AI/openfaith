import type { Schema, Transaction } from '@rocicorp/zero'
import { Effect } from 'effect'
import { MutatorDatabaseError } from './effectMutatorBridge'

/**
 * Effect-based wrapper around Zero Transaction
 * Converts Promise-based transaction operations to Effect operations
 */
export class EffectTransaction<TSchema extends Schema> {
  constructor(private tx: Transaction<TSchema>) {}

  /**
   * Wraps transaction mutate operations in Effect
   */
  get mutate() {
    return this.createMutateProxy(this.tx.mutate)
  }

  /**
   * Wraps transaction query operations in Effect
   */
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
                new MutatorDatabaseError({
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
                new MutatorDatabaseError({
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
 * Creates an Effect-based transaction wrapper
 */
export const createEffectTransaction = <TSchema extends Schema>(tx: Transaction<TSchema>) =>
  new EffectTransaction(tx)
