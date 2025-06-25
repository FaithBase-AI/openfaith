import type {
  BucketDetails,
  RateLimitStoreService,
} from '@openfaith/adapter-core/ratelimit/RateLimit'
import { Effect, Option } from 'effect'

interface Counter {
  count: number
  expires: number
}

export const make = (): RateLimitStoreService => {
  const buckets = new Map<string, BucketDetails>()
  const routes = new Map<string, string>()
  const counters = new Map<string, Counter>()

  const getCounter = (key: string) =>
    Option.filter(Option.fromNullable(counters.get(key)), (c) => c.expires > Date.now())

  const getBucketForRoute = (route: string) =>
    Effect.sync(() => Option.fromNullable(buckets.get(routes.get(route)!)))

  return {
    getBucketForRoute,
    hasBucket: (key) => Effect.sync(() => buckets.has(key)),

    incrementCounter: (key, window, limit) =>
      Effect.sync(() => {
        const now = Date.now()
        const perRequest = Math.ceil(window / limit)
        const counter = Option.getOrElse(
          getCounter(key),
          (): Counter => ({
            count: 0,
            expires: now,
          }),
        )

        const count = counter.count + 1
        const expires = counter.expires + perRequest
        counters.set(key, { ...counter, count, expires })

        return [count, expires - now]
      }),

    putBucket: (bucket) =>
      Effect.sync(() => {
        buckets.set(bucket.key, bucket)
      }),

    putBucketRoute: (route, bucket) =>
      Effect.sync(() => {
        routes.set(route, bucket)
      }),

    removeCounter: (key) =>
      Effect.sync(() => {
        counters.delete(key)
      }),
  }
}
