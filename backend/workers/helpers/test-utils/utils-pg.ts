import { PgClient } from '@effect/sql-pg'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { Data, Effect, Layer, Redacted, String } from 'effect'

export class ContainerError extends Data.TaggedError('ContainerError')<{
  cause: unknown
}> {}

export class PgContainer extends Effect.Service<PgContainer>()('test/PgContainer', {
  scoped: Effect.acquireRelease(
    Effect.tryPromise({
      catch: (cause) => {
        console.error(cause)

        return new ContainerError({ cause })
      },
      try: async () => {
        console.log('Starting PostgreSQL container for bun...')
        const container = await new PostgreSqlContainer('postgres:alpine')
          .withStartupTimeout(120000) // 2 minutes
          .start()
        console.log('PostgreSQL container started successfully')
        console.log('Connection URI:', container.getConnectionUri())
        return container
      },
    }),
    (container) => Effect.promise(() => container.stop()),
  ),
}) {
  static ClientLive = Layer.unwrapEffect(
    Effect.gen(function* () {
      const container = yield* PgContainer
      return PgClient.layer({
        url: Redacted.make(container.getConnectionUri()),
      })
    }),
  ).pipe(Layer.provide(this.Default))

  static ClientTransformLive = Layer.unwrapEffect(
    Effect.gen(function* () {
      const container = yield* PgContainer
      return PgClient.layer({
        transformQueryNames: String.camelToSnake,
        transformResultNames: String.snakeToCamel,
        url: Redacted.make(container.getConnectionUri()),
      })
    }),
  ).pipe(Layer.provide(this.Default))
}
