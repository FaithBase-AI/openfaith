/**
 * Example usage of @openfaith/bun-test
 */
import { expect } from 'bun:test'
import { effect, layer, live, scoped } from '@openfaith/bun-test/index.js'
import { Context, Effect, Layer } from 'effect'

// Example service
class ExampleService extends Context.Tag('ExampleService')<
  ExampleService,
  {
    getValue: () => Effect.Effect<string>
  }
>() {
  static Live = Layer.succeed(ExampleService, {
    getValue: () => Effect.succeed('test-value'),
  })
}

// Basic Effect test
effect('should run effect test', () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed(42)
    expect(result).toBe(42)
  }),
)

// Live test (no test environment)
live('should run live test', () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed('hello')
    expect(result).toBe('hello')
  }),
)

// Scoped test
scoped('should run scoped test', () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed('scoped')
    expect(result).toBe('scoped')
  }),
)

// Layer test
layer(ExampleService.Live)('with example service', (it) => {
  it.effect('should use service', () =>
    Effect.gen(function* () {
      const service = yield* ExampleService
      const value = yield* service.getValue()
      expect(value).toBe('test-value')
    }),
  )

  it.live('should run live test in layer', () =>
    Effect.gen(function* () {
      const result = yield* Effect.succeed('layer-live')
      expect(result).toBe('layer-live')
    }),
  )
})
