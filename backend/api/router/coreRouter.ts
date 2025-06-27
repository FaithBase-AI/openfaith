/** biome-ignore-all lint/suspicious/useAwait: test function */

import { NodeSdk } from '@effect/opentelemetry'
import { FetchHttpClient } from '@effect/platform'
import { createPaginatedStream, TokenKey } from '@openfaith/adapter-core/server'
import { createTRPCRouter, protectedProcedure } from '@openfaith/api/trpc'
import { DBLive } from '@openfaith/db'
import { PcoApiLayer, PcoHttpClient } from '@openfaith/pco/server'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Array, Effect, pipe, Stream } from 'effect'

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'openfaith-backend' },
  spanProcessor: [
    new BatchSpanProcessor(new OTLPTraceExporter()),
    // new BatchSpanProcessor(new ConsoleSpanExporter()),
  ],
}))

export const coreRouter = createTRPCRouter({
  testFunction: protectedProcedure.mutation(async () => {
    try {
      console.log('test function start')

      const program = Effect.gen(function* () {
        const pcoClient = yield* PcoHttpClient

        return yield* Effect.all(
          pipe(
            Array.range(1, 150),
            Array.map((x) =>
              Stream.runForEach(
                createPaginatedStream(pcoClient.people.getAll, {
                  urlParams: {
                    include: 'addresses',
                  },
                } as const),
                (response) =>
                  Effect.log({
                    index: x,
                    offset: response.meta.next?.offset || 0,
                    totalCount: response.meta.total_count,
                  }),
              ),
            ),
          ),
          { concurrency: 'unbounded' },
        )
      }).pipe(
        Effect.withSpan('test-fn'),
        Effect.provide(PcoApiLayer),
        Effect.provide(FetchHttpClient.layer),
        Effect.provide(DBLive),
        Effect.provideService(TokenKey, 'org_01jww7zkeyfzvsxd20nfjzc21z'),
        Effect.provide(NodeSdkLive),
      )

      const result = await Effect.runPromiseExit(program)

      console.log(result)
      console.log(JSON.stringify(result))

      console.log('test function finish')
    } catch (error) {
      console.log(error)
    }

    return 'yeet'
  }),
})
