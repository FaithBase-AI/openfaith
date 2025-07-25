import { UnsupportedAdapterError } from '@openfaith/adapter-core/errors/adapterErrors'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { AdapterRegistry } from '@openfaith/every-adapter/adapterRegistry'
import { Context, Effect, Layer, Record } from 'effect'

export type AdapterConfig = {
  readonly tag: string
  readonly layer: Layer.Layer<AdapterOperations>
}

export const makeAdapterRegistry = (
  adapters: ReadonlyArray<AdapterConfig>,
): Layer.Layer<AdapterRegistry> => {
  const adapterMap = Record.fromEntries(
    adapters.map((adapter) => [adapter.tag, adapter.layer] as const),
  )

  const supportedAdapters = adapters.map((adapter) => adapter.tag)

  return Layer.effect(
    AdapterRegistry,
    Effect.gen(function* () {
      return AdapterRegistry.of({
        getOperations: (adapterTag: string) =>
          Effect.gen(function* () {
            const layer = Record.get(adapterMap, adapterTag)
            if (layer._tag === 'None') {
              return yield* Effect.fail(
                new UnsupportedAdapterError({
                  adapter: adapterTag,
                  message: `Adapter '${adapterTag}' is not supported. Supported adapters: ${supportedAdapters.join(', ')}`,
                }),
              )
            }

            return yield* Effect.scoped(
              Effect.gen(function* () {
                const context = yield* Layer.build(layer.value)
                return Context.get(context, AdapterOperations)
              }),
            )
          }),

        isAdapterSupported: (adapterTag: string) => Record.has(adapterMap, adapterTag),

        listSupportedAdapters: () => supportedAdapters,
      })
    }),
  )
}
