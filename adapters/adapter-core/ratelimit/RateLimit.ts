import * as Memory from '@openfaith/adapter-core/ratelimit/memory'
import { delayFrom } from '@openfaith/adapter-core/ratelimit/utils'
import { Context, Duration, Effect, Layer, type Option } from 'effect'

// This is pulled from https://github.com/tim-smart/dfx/blob/main/src/RateLimit.ts

export type BucketDetails = {
  key: 'global' | string
  resetAfter: number
  limit: number
}

export interface RateLimitStoreService {
  readonly hasBucket: (bucketKey: string) => Effect.Effect<boolean, any>

  readonly putBucket: (bucket: BucketDetails) => Effect.Effect<void, any>

  readonly getBucketForRoute: (route: string) => Effect.Effect<Option.Option<BucketDetails>, any>

  readonly putBucketRoute: (route: string, bucketKey: string) => Effect.Effect<void, any>

  readonly incrementCounter: (
    key: string,
    window: number,
    limit: number,
  ) => Effect.Effect<readonly [count: number, ttl: number], any>

  readonly removeCounter: (key: string) => Effect.Effect<void, any>
}

export interface RateLimitStore {
  readonly _: unique symbol
}

export const RateLimitStore = Context.GenericTag<RateLimitStore, RateLimitStoreService>(
  '@OpenFaith/RateLimit/RateLimitStore',
)
export const MemoryRateLimitStoreLive = Layer.sync(RateLimitStore, Memory.make)

const makeLimiter = Effect.gen(function* () {
  const store = yield* RateLimitStore

  const maybeWait = (key: string, window: Duration.Duration, limit: number, multiplier = 1.05) => {
    const windowMs = Duration.toMillis(window) * multiplier

    return store.incrementCounter(key, windowMs, limit).pipe(
      Effect.map(([count, ttl]) => delayFrom(windowMs, limit, count, ttl)),
      Effect.tap((d) =>
        Effect.annotateLogs(Effect.logTrace('maybeWait'), {
          delay: Duration.toMillis(d),
          key,
          limit,
          service: 'RateLimit',
          window: Duration.toMillis(window),
          windowMs,
        }),
      ),
      Effect.tap((_) => (Duration.toMillis(_) === 0 ? Effect.void : Effect.sleep(_))),
      Effect.asVoid,
    )
  }

  return { maybeWait }
})

export interface RateLimiter {
  readonly _: unique symbol
}
export const RateLimiter = Context.GenericTag<
  RateLimiter,
  Effect.Effect.Success<typeof makeLimiter>
>('@OpenFaith/RateLimit/RateLimiter')
export const RateLimiterLive = Layer.effect(RateLimiter, makeLimiter)
