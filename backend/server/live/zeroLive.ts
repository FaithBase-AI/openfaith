import { schema } from '@openfaith/zero'
import {
  type ZeroSchemaStore,
  ZeroStore,
  layer as ZeroStoreLayer,
} from '@openfaith/zero-effect/server'
import { Context, Effect, Layer } from 'effect'

/**
 * Schema-specific Zero store tag for the application schema
 */
export class AppZeroStore extends Context.Tag('@openfaith/server/AppZeroStore')<
  AppZeroStore,
  ZeroSchemaStore<typeof schema>
>() {}

/**
 * Live implementation that creates a schema-specific Zero store
 */
export const AppZeroStoreLive = Layer.effect(
  AppZeroStore,
  Effect.gen(function* () {
    const zeroStore = yield* ZeroStore
    return zeroStore.forSchema(schema)
  }),
)

/**
 * Combined layer that provides the schema-specific Zero store
 */
export const ZeroLive = Layer.provide(AppZeroStoreLive, ZeroStoreLayer)
