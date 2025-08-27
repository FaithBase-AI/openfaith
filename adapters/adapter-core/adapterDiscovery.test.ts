import { expect } from 'bun:test'
import { BunContext } from '@effect/platform-bun'
import { AdapterDiscovery } from '@openfaith/adapter-core/adapterDiscovery'
import { effect } from '@openfaith/bun-test'
import { Array, Effect, Either, HashMap, Layer, Option, pipe } from 'effect'

const AdapterDiscoveryTestLayer = pipe(AdapterDiscovery.Default, Layer.provide(BunContext.layer))

effect(
  'AdapterDiscovery.discoverAdapters finds pco and ccb adapters',
  () =>
    Effect.gen(function* () {
      const service = yield* AdapterDiscovery
      const adapters = yield* service.discoverAdapters()

      // Should find at least pco and ccb
      const adapterNames = pipe(
        adapters,
        Array.map((adapter) => adapter.name),
      )

      expect(adapterNames).toContain('pco')
      expect(adapterNames).toContain('ccb')

      // Should not include adapter-core or every-adapter
      expect(adapterNames).not.toContain('adapter-core')
      expect(adapterNames).not.toContain('every-adapter')

      // Each adapter should have required fields
      pipe(
        adapters,
        Array.forEach((adapter) => {
          expect(adapter.name).toBeDefined()
          expect(adapter.displayName).toBeDefined()
          expect(adapter.directory).toBeDefined()
          expect(adapter.packageJsonPath).toBeDefined()
          expect(typeof adapter.hasManifest).toBe('boolean')
          expect(typeof adapter.hasClient).toBe('boolean')
        }),
      )
    }).pipe(Effect.provide(AdapterDiscoveryTestLayer)),
  { timeout: 10000 },
)

effect(
  'AdapterDiscovery.getAdapter retrieves specific adapter',
  () =>
    Effect.gen(function* () {
      const service = yield* AdapterDiscovery
      const pcoAdapter = yield* service.getAdapter('pco')

      expect(pcoAdapter.name).toBe('pco')
      expect(pcoAdapter.displayName).toBeDefined()
      // PCO has client.ts but not manifest.ts
      expect(pcoAdapter.hasManifest).toBe(false)
      expect(pcoAdapter.hasClient).toBe(true)

      if (pcoAdapter.hasClient) {
        const clientPath = pipe(
          pcoAdapter.clientPath,
          Option.getOrElse(() => ''),
        )
        expect(clientPath).toContain('pco/client.ts')
      }
    }).pipe(Effect.provide(AdapterDiscoveryTestLayer)),
  { timeout: 10000 },
)

effect(
  'AdapterDiscovery.getAdapter fails for non-existent adapter',
  () =>
    Effect.gen(function* () {
      const service = yield* AdapterDiscovery
      const result = yield* pipe(service.getAdapter('non-existent'), Effect.either)

      expect(Either.isLeft(result)).toBe(true)
    }).pipe(Effect.provide(AdapterDiscoveryTestLayer)),
  { timeout: 10000 },
)

effect(
  'AdapterDiscovery.getAdapterMap returns HashMap of adapters',
  () =>
    Effect.gen(function* () {
      const service = yield* AdapterDiscovery
      const adapterMap = yield* service.getAdapterMap()

      // Check that pco and ccb are in the map
      const pcoOpt = pipe(adapterMap, HashMap.get('pco'))
      const ccbOpt = pipe(adapterMap, HashMap.get('ccb'))

      expect(Option.isSome(pcoOpt)).toBe(true)
      expect(Option.isSome(ccbOpt)).toBe(true)

      // Verify adapter-core is not in the map
      const coreOpt = pipe(adapterMap, HashMap.get('adapter-core'))
      expect(Option.isNone(coreOpt)).toBe(true)
    }).pipe(Effect.provide(AdapterDiscoveryTestLayer)),
  { timeout: 10000 },
)

effect(
  'AdapterDiscovery.listAdapterNames returns array of names',
  () =>
    Effect.gen(function* () {
      const service = yield* AdapterDiscovery
      const names = yield* service.listAdapterNames()

      expect(Array.isArray(names)).toBe(true)
      expect(names).toContain('pco')
      expect(names).toContain('ccb')
      expect(names).not.toContain('adapter-core')
      expect(names).not.toContain('every-adapter')
    }).pipe(Effect.provide(AdapterDiscoveryTestLayer)),
  { timeout: 10000 },
)

effect(
  'AdapterDiscovery.hasAdapter checks adapter existence',
  () =>
    Effect.gen(function* () {
      const service = yield* AdapterDiscovery
      const hasPco = yield* service.hasAdapter('pco')
      const hasCcb = yield* service.hasAdapter('ccb')
      const hasNonExistent = yield* service.hasAdapter('non-existent')

      expect(hasPco).toBe(true)
      expect(hasCcb).toBe(true)
      expect(hasNonExistent).toBe(false)
    }).pipe(Effect.provide(AdapterDiscoveryTestLayer)),
  { timeout: 10000 },
)

effect(
  'AdapterMetadata correctly identifies client files',
  () =>
    Effect.gen(function* () {
      const service = yield* AdapterDiscovery
      const pcoAdapter = yield* service.getAdapter('pco')

      // PCO has client but not manifest
      expect(pcoAdapter.hasManifest).toBe(false)
      expect(pcoAdapter.hasClient).toBe(true)

      // Check manifest path is none
      expect(Option.isNone(pcoAdapter.manifestPath)).toBe(true)

      // Check client path exists
      if (pcoAdapter.hasClient) {
        const clientPath = pipe(
          pcoAdapter.clientPath,
          Option.getOrElse(() => ''),
        )
        expect(clientPath).toContain('pco/client.ts')
      }
    }).pipe(Effect.provide(AdapterDiscoveryTestLayer)),
  { timeout: 10000 },
)
