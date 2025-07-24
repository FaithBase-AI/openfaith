import { PgClient } from '@effect/sql-pg'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { Effect, Layer, Redacted, Schema, String } from 'effect'
import { Wait } from 'testcontainers'

export class ContainerError extends Schema.TaggedError<ContainerError>()('ContainerError', {
  cause: Schema.Unknown,
}) {}

export class PgContainer extends Effect.Service<PgContainer>()('test/PgContainer', {
  scoped: Effect.acquireRelease(
    Effect.tryPromise({
      catch: (cause) => new ContainerError({ cause }),
      try: async () =>
        new PostgreSqlContainer('postgres:alpine').withWaitStrategy(Wait.forHealthCheck()).start(),
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
