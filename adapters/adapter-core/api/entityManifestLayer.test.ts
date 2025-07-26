import { expect } from 'bun:test'
import { EntityManifest } from '@openfaith/adapter-core/api/entityManifestLayer'
import { effect } from '@openfaith/bun-test'
import { Effect, Layer } from 'effect'

effect('EntityManifest should have correct context tag identifier', () =>
  Effect.gen(function* () {
    expect(EntityManifest.key).toBe('@openfaith/adapter-core/EntityManifest')
  }),
)

effect('EntityManifest should work with empty manifest', () =>
  Effect.gen(function* () {
    const emptyManifest = {}
    const emptyLayer = Layer.succeed(EntityManifest, emptyManifest)

    const result = yield* Effect.provide(
      Effect.gen(function* () {
        const manifest = yield* EntityManifest
        return manifest
      }),
      emptyLayer,
    )

    expect(Object.keys(result)).toEqual([])
  }),
)

effect('EntityManifest should be a Context.Tag', () =>
  Effect.gen(function* () {
    // Test that EntityManifest is a proper Context.Tag
    expect(typeof EntityManifest).toBe('function')
    expect(EntityManifest.key).toBeDefined()
    expect(typeof EntityManifest.key).toBe('string')
  }),
)

effect('EntityManifest should work with Layer.succeed', () =>
  Effect.gen(function* () {
    const testData = {}
    const layer = Layer.succeed(EntityManifest, testData)

    // Test that the layer can be created successfully
    expect(layer).toBeDefined()

    // Test that the layer provides the correct value
    const result = yield* Effect.provide(EntityManifest, layer)
    expect(result).toBe(testData)
  }),
)
