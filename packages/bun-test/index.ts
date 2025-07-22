/**
 * @since 1.0.0
 */

import * as internal from '@openfaith/bun-test/internal/internal.js'
import type * as Duration from 'effect/Duration'
import type * as Effect from 'effect/Effect'
import type * as FC from 'effect/FastCheck'
import type * as Layer from 'effect/Layer'
import type * as Schema from 'effect/Schema'
import type * as Scope from 'effect/Scope'
import type * as TestServices from 'effect/TestServices'

/**
 * @since 1.0.0
 */
export * from 'bun:test'

/**
 * @since 1.0.0
 */
export namespace BunTest {
  /**
   * @since 1.0.0
   */
  export type TestFunction<A, E, R, TestArgs extends Array<any>> = (
    ...args: TestArgs
  ) => Effect.Effect<A, E, R>

  /**
   * @since 1.0.0
   */
  export type Test<R> = <A, E>(
    name: string,
    self: TestFunction<A, E, R, [any]>,
    timeout?: number | { timeout?: number },
  ) => void

  /**
   * @since 1.0.0
   */
  export type Arbitraries =
    | Array<Schema.Schema.Any | FC.Arbitrary<any>>
    | { [K in string]: Schema.Schema.Any | FC.Arbitrary<any> }

  /**
   * @since 1.0.0
   */
  export interface Tester<R> extends BunTest.Test<R> {
    skip: BunTest.Test<R>
    skipIf: (condition: unknown) => BunTest.Test<R>
    runIf: (condition: unknown) => BunTest.Test<R>
    only: BunTest.Test<R>
    each: <T>(
      cases: ReadonlyArray<T>,
    ) => <A, E>(
      name: string,
      self: TestFunction<A, E, R, Array<T>>,
      timeout?: number | { timeout?: number },
    ) => void
    fails: BunTest.Test<R>
    prop: <const Arbs extends Arbitraries, A, E>(
      name: string,
      arbitraries: Arbs,
      self: TestFunction<A, E, R, [any, any]>,
      timeout?: number | { timeout?: number; fastCheck?: any },
    ) => void
  }

  /**
   * @since 1.0.0
   */
  export interface Methods {
    readonly effect: BunTest.Tester<TestServices.TestServices>
    readonly flakyTest: <A, E, R>(
      self: Effect.Effect<A, E, R>,
      timeout?: Duration.DurationInput,
    ) => Effect.Effect<A, never, R>
    readonly scoped: BunTest.Tester<TestServices.TestServices | Scope.Scope>
    readonly live: BunTest.Tester<never>
    readonly scopedLive: BunTest.Tester<Scope.Scope>
    readonly layer: <R, E>(
      layer: Layer.Layer<R, E>,
      options?: {
        readonly timeout?: Duration.DurationInput
      },
    ) => {
      (f: (it: any) => void): void
      (name: string, f: (it: any) => void): void
    }
    readonly prop: <const Arbs extends Arbitraries>(
      name: string,
      arbitraries: Arbs,
      self: (properties: any, ctx: any) => void,
      timeout?: number | { timeout?: number; fastCheck?: any },
    ) => void
  }
}

/**
 * @since 1.0.0
 */
export const addEqualityTesters: () => void = internal.addEqualityTesters

/**
 * @since 1.0.0
 */
export const effect: BunTest.Tester<TestServices.TestServices> = internal.effect

/**
 * @since 1.0.0
 */
export const scoped: BunTest.Tester<TestServices.TestServices | Scope.Scope> = internal.scoped

/**
 * @since 1.0.0
 */
export const live: BunTest.Tester<never> = internal.live

/**
 * @since 1.0.0
 */
export const scopedLive: BunTest.Tester<Scope.Scope> = internal.scopedLive

/**
 * Share a `Layer` between multiple tests, optionally wrapping
 * the tests in a `describe` block if a name is provided.
 *
 * @since 1.0.0
 */
export const layer: <R, E>(
  layer_: Layer.Layer<R, E>,
  options?: {
    readonly memoMap?: Layer.MemoMap
    readonly timeout?: Duration.DurationInput
    readonly excludeTestServices?: boolean
  },
) => {
  (f: (it: any) => void): void
  (name: string, f: (it: any) => void): void
} = internal.layer

/**
 * @since 1.0.0
 */
export const flakyTest: <A, E, R>(
  self: Effect.Effect<A, E, R>,
  timeout?: Duration.DurationInput,
) => Effect.Effect<A, never, R> = internal.flakyTest

/**
 * @since 1.0.0
 */
export const prop: BunTest.Methods['prop'] = internal.prop

/**
 * @since 1.0.0
 */
export const makeMethods: (it: any) => BunTest.Methods = internal.makeMethods

/**
 * @since 1.0.0
 */
export const describeWrapped: (name: string, f: (it: BunTest.Methods) => void) => void =
  internal.describeWrapped
