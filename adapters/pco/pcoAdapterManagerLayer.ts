/**
 * PCO AdapterManager Layer
 *
 * Provides a complete layer configuration for the PCO AdapterManager
 * with all necessary dependencies
 */

import {
  MemoryRateLimitStoreLive,
  RateLimiterLive,
} from '@openfaith/adapter-core/layers/ratelimit/RateLimit'
import { BasePcoApiLayer } from '@openfaith/pco/api/pcoApi'
import { PcoAdapterManagerLive } from '@openfaith/pco/pcoAdapterManagerLive'
import { TokenAuthLive } from '@openfaith/server/live/tokenAuthLive'
import { TokenManagerLive } from '@openfaith/server/live/tokenManagerLive'
import { Layer } from 'effect'

export const PcoAdapterManagerLayer = PcoAdapterManagerLive.pipe(
  Layer.provide(BasePcoApiLayer),
  Layer.provideMerge(TokenAuthLive),
  Layer.provideMerge(TokenManagerLive),
  Layer.provideMerge(RateLimiterLive),
  Layer.provideMerge(MemoryRateLimitStoreLive),
)
