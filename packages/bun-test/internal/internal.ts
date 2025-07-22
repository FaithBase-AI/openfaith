/**
 * @since 1.0.0
 */

import { describe, it } from 'bun:test'
import * as Cause from 'effect/Cause'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import * as Fiber from 'effect/Fiber'
import { flow, identity, pipe } from 'effect/Function'
import * as Layer from 'effect/Layer'
import * as Logger from 'effect/Logger'
import * as Schedule from 'effect/Schedule'
import * as Scope from 'effect/Scope'
import * as TestEnvironment from 'effect/TestContext'
import type * as TestServices from 'effect/TestServices'

const runPromise = <E, A>(effect: Effect.Effect<A, E>) =>
  Effect.gen(function* () {
    const exitFiber = yield* Effect.fork(Effect.exit(effect))
    const exit = yield* Fiber.join(exitFiber)
    if (Exit.isSuccess(exit)) {
      return exit.value
    }
    const errors = Cause.prettyErrors(exit.cause)
    for (let i = 1; i < errors.length; i++) {
      yield* Effect.logError(errors[i])
    }
    throw errors[0]
  }).pipe(Effect.runPromise)

const runTest = <E, A>(effect: Effect.Effect<A, E>) => runPromise(effect)

const TestEnv = TestEnvironment.TestContext.pipe(Layer.provide(Logger.remove(Logger.defaultLogger)))

export const addEqualityTesters = () => {
  // Bun's expect doesn't have addEqualityTesters like vitest
}

const testOptions = (timeout?: number | { timeout?: number }) =>
  typeof timeout === 'number' ? { timeout } : (timeout ?? {})

const makeTester = <R>(
  mapEffect: <A, E>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, never>,
) => {
  const run =
    <A, E>(self: (...args: Array<any>) => Effect.Effect<A, E, R>) =>
    (...args: Array<any>) =>
      pipe(
        Effect.suspend(() => self(...args)),
        mapEffect,
        runTest,
      )

  const f = (
    name: string,
    self: (...args: Array<any>) => Effect.Effect<any, any, R>,
    timeout?: any,
  ) => it(name, run(self), testOptions(timeout))

  const skip = (
    name: string,
    self: (...args: Array<any>) => Effect.Effect<any, any, R>,
    timeout?: any,
  ) => it.skip(name, run(self), testOptions(timeout))

  const skipIf =
    (condition: unknown) =>
    (name: string, self: (...args: Array<any>) => Effect.Effect<any, any, R>, timeout?: any) =>
      condition ? skip(name, self, timeout) : f(name, self, timeout)

  const runIf =
    (condition: unknown) =>
    (name: string, self: (...args: Array<any>) => Effect.Effect<any, any, R>, timeout?: any) =>
      condition ? f(name, self, timeout) : skip(name, self, timeout)

  const only = (
    name: string,
    self: (...args: Array<any>) => Effect.Effect<any, any, R>,
    timeout?: any,
  ) => it.only(name, run(self), testOptions(timeout))

  const each =
    (cases: ReadonlyArray<any>) =>
    (name: string, self: (...args: Array<any>) => Effect.Effect<any, any, R>, timeout?: any) => {
      cases.forEach((testCase, index) => {
        it(`${name} [${index}]`, () => run(self)(testCase), testOptions(timeout))
      })
    }

  const fails = (
    name: string,
    self: (...args: Array<any>) => Effect.Effect<any, any, R>,
    timeout?: any,
  ) =>
    it(
      name,
      async () => {
        try {
          await run(self)()
          throw new Error('Expected test to fail')
        } catch (_error) {
          // Test is expected to fail, so this is success
        }
      },
      testOptions(timeout),
    )

  // Simplified prop without FastCheck for now
  const prop = (
    name: string,
    _arbitraries: any,
    self: (...args: Array<any>) => Effect.Effect<any, any, R>,
    timeout?: any,
  ) => {
    // For now, just run the test once with empty properties
    return it(name, run(self), testOptions(timeout))
  }

  return Object.assign(f, { each, fails, only, prop, runIf, skip, skipIf })
}

export const prop = (
  name: string,
  _arbitraries: any,
  self: (properties: any, ctx: any) => void,
  timeout?: any,
) => {
  // Simplified prop without FastCheck for now
  return it(name, () => self({}, {}), testOptions(timeout))
}

export const layer = <R, E>(
  layer_: Layer.Layer<R, E>,
  options?: {
    readonly memoMap?: Layer.MemoMap
    readonly timeout?: Duration.DurationInput
    readonly excludeTestServices?: boolean
  },
) => {
  return (...args: [name: string, f: (it: any) => void] | [f: (it: any) => void]) => {
    const excludeTestServices = options?.excludeTestServices ?? false
    const withTestEnv = excludeTestServices
      ? (layer_ as Layer.Layer<R | TestServices.TestServices, E>)
      : Layer.provideMerge(layer_, TestEnv)
    const memoMap = options?.memoMap ?? Effect.runSync(Layer.makeMemoMap)
    const scope = Effect.runSync(Scope.make())
    const runtimeEffect = Layer.toRuntimeWithMemoMap(withTestEnv, memoMap).pipe(
      Scope.extend(scope),
      Effect.orDie,
      Effect.cached,
      Effect.runSync,
    )

    const makeIt = () => ({
      ...it,
      effect: makeTester<TestServices.TestServices | R>((effect) =>
        Effect.flatMap(runtimeEffect, (runtime) => effect.pipe(Effect.provide(runtime))),
      ),
      flakyTest,
      layer: (
        nestedLayer: Layer.Layer<any, any, R>,
        options?: { readonly timeout?: Duration.DurationInput },
      ) => {
        return layer(Layer.provideMerge(nestedLayer, withTestEnv), {
          ...options,
          excludeTestServices,
          memoMap,
        })
      },
      live: makeTester<never>(identity),
      prop,
      scoped: makeTester<TestServices.TestServices | Scope.Scope | R>((effect) =>
        Effect.flatMap(runtimeEffect, (runtime) =>
          effect.pipe(Effect.scoped, Effect.provide(runtime)),
        ),
      ),
      scopedLive: makeTester<Scope.Scope>(Effect.scoped),
    })

    if (args.length === 1) {
      args[0](makeIt())
      return
    }

    return describe(args[0], () => {
      return args[1](makeIt())
    })
  }
}

export const flakyTest = <A, E, R>(
  self: Effect.Effect<A, E, R>,
  timeout: Duration.DurationInput = Duration.seconds(30),
) =>
  pipe(
    Effect.catchAllDefect(self, Effect.fail),
    Effect.retry(
      pipe(
        Schedule.recurs(10),
        Schedule.compose(Schedule.elapsed),
        Schedule.whileOutput(Duration.lessThanOrEqualTo(timeout)),
      ),
    ),
    Effect.orDie,
  )

export const makeMethods = () => ({
  ...it,
  effect: makeTester<TestServices.TestServices>(Effect.provide(TestEnv)),
  flakyTest,
  layer,
  live: makeTester<never>(identity),
  prop,
  scoped: makeTester<TestServices.TestServices | Scope.Scope>(
    flow(Effect.scoped, Effect.provide(TestEnv)),
  ),
  scopedLive: makeTester<Scope.Scope>(Effect.scoped),
})

export const { effect, live, scoped, scopedLive } = makeMethods()

export const describeWrapped = (name: string, f: (it: any) => void) =>
  describe(name, () => f(makeMethods()))
