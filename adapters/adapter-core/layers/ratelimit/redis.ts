import type { BucketDetails } from '@openfaith/adapter-core/layers/ratelimit/RateLimit'
import { RateLimitStore } from '@openfaith/adapter-core/layers/ratelimit/RateLimit'
import { Data, Effect, Layer, Option } from 'effect'
import { Redis, type RedisError } from 'effect-redis'

// Custom error for better diagnostics
class CorruptDataError extends Data.TaggedError('CorruptDataError')<{
  readonly error: unknown
}> {}

const bucketsKey = 'openfaith:ratelimit:buckets'
const routesKey = 'openfaith:ratelimit:routes'
const counterKey = (key: string) => `openfaith:ratelimit:counter:${key}`

/**
 * This Lua script provides the atomic "increment and update expiry" logic.
 * It remains unchanged as it is pure Redis-side logic.
 *
 * KEYS[1]: The Redis key for the counter hash
 * ARGV[1]: The current time in milliseconds (from the client)
 * ARGV[2]: The window size in milliseconds
 * ARGV[3]: The request limit for the window
 *
 * It returns a tuple of [new_count, ttl_in_ms].
 */
const incrementLua = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

local per_request = math.ceil(window / limit)

-- hgetall returns a list of key/value pairs. { "count", "1", "expires", "123456" }
-- We check if counter[4] (the value of 'expires') is greater than now.
local counter = redis.call('HGETALL', key)
local count = 0
local expires = now

if #counter > 0 and tonumber(counter[4]) > now then
  count = tonumber(counter[2])
  expires = tonumber(counter[4])
end

local new_count = count + 1
local new_expires = expires + per_request

redis.call('HSET', key, 'count', new_count, 'expires', new_expires)

local key_ttl_ms = new_expires - now
if key_ttl_ms > 0 then
  redis.call('PEXPIRE', key, key_ttl_ms)
end

return {tostring(new_count), tostring(key_ttl_ms)}
`

const make = Effect.gen(function* () {
  // We get the low-level Redis service from the context.
  const redis = yield* Redis

  // Helper to use the raw redis client. All commands are now wrapped in `redis.use`.
  const use = redis.use

  const getBucketForRoute = (
    route: string,
  ): Effect.Effect<Option.Option<BucketDetails>, RedisError | CorruptDataError> =>
    use((client) => client.hGet(routesKey, route)).pipe(
      Effect.map(Option.fromNullable),
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.succeed(Option.none()),
          onSome: (bucketKey) =>
            use((client) => client.hGet(bucketsKey, bucketKey)).pipe(
              Effect.map(Option.fromNullable),
              Effect.flatMap(
                Option.match({
                  onNone: () => Effect.succeed(Option.none()),
                  onSome: (blob) =>
                    Effect.try({
                      catch: (error) => new CorruptDataError({ error }),
                      try: () => Option.some(JSON.parse(blob) as BucketDetails),
                    }),
                }),
              ),
            ),
        }),
      ),
    )

  return RateLimitStore.of({
    getBucketForRoute,
    hasBucket: (key) => use((client) => client.hExists(bucketsKey, key)).pipe(Effect.map(Boolean)),

    incrementCounter: (key, window, limit) =>
      Effect.suspend(() => {
        const now = Date.now()
        return use((client) =>
          client.eval(incrementLua, {
            arguments: [now.toString(), window.toString(), limit.toString()],
            keys: [counterKey(key)],
          }),
        )
      }).pipe(
        Effect.map(
          (result) =>
            [Number((result as Array<string>)[0]), Number((result as Array<string>)[1])] as const,
        ),
      ),

    putBucket: (bucket) =>
      use((client) => client.hSet(bucketsKey, bucket.key, JSON.stringify(bucket))).pipe(
        Effect.asVoid,
      ),

    putBucketRoute: (route, bucketKey) =>
      use((client) => client.hSet(routesKey, route, bucketKey)).pipe(Effect.asVoid),

    removeCounter: (key) => use((client) => client.del(counterKey(key))).pipe(Effect.asVoid),
  })
})

/**
 * A Layer that provides a RateLimitStore implementation backed by Redis.
 *
 * This layer requires the `Redis` service from the `effect-redis` package.
 */
export const RedisRateLimitStoreLive = Layer.effect(RateLimitStore, make)
