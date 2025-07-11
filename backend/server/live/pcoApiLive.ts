import {
  MemoryRateLimitStoreLive,
  RateLimiterLive,
} from '@openfaith/adapter-core/layers/ratelimit/RateLimit'
import { BasePcoApiLayer } from '@openfaith/pco/server'
import { TokenAuthLive } from '@openfaith/server/live/tokenAuthLive'
import { Layer } from 'effect'

export const PcoApiLayer = BasePcoApiLayer.pipe(
  Layer.provideMerge(TokenAuthLive),
  Layer.provideMerge(RateLimiterLive),
  Layer.provideMerge(MemoryRateLimitStoreLive),
)
