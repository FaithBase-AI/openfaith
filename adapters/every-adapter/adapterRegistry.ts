import type { UnsupportedAdapterError } from '@openfaith/adapter-core/errors/adapterErrors'
import type { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { Context, type Effect } from 'effect'

export class AdapterRegistry extends Context.Tag('@openfaith/every-adapter/AdapterRegistry')<
  AdapterRegistry,
  {
    readonly getOperations: (
      adapterTag: string,
    ) => Effect.Effect<Context.Tag.Service<AdapterOperations>, UnsupportedAdapterError>

    readonly listSupportedAdapters: () => ReadonlyArray<string>

    readonly isAdapterSupported: (adapterTag: string) => boolean
  }
>() {}
