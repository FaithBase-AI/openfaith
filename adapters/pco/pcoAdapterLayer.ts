import {
  MemoryRateLimitStoreLive,
  RateLimiterLive,
} from '@openfaith/adapter-core/layers/ratelimit/RateLimit'
import { BasePcoApiLayer } from '@openfaith/pco/api/pcoApi'
import { PcoOperationsLive } from '@openfaith/pco/pcoOperationsLive'
import { TokenAuthLive } from '@openfaith/server/live/tokenAuthLive'
import { TokenManagerLive } from '@openfaith/server/live/tokenManagerLive'
import { Layer } from 'effect'

export const PcoAdapterLayer = Layer.mergeAll(BasePcoApiLayer, PcoOperationsLive).pipe(
  Layer.provide(BasePcoApiLayer),
)

// Create a layer that provides all PCO dependencies except TokenKey
// TokenKey should be provided at runtime using Effect.provideService
export const PcoAdapterOperationsLayer = PcoOperationsLive.pipe(
  Layer.provide(BasePcoApiLayer),
  Layer.provideMerge(TokenAuthLive),
  Layer.provideMerge(TokenManagerLive),
  Layer.provideMerge(RateLimiterLive),
  Layer.provideMerge(MemoryRateLimitStoreLive),
)
