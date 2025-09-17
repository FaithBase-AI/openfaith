/**
 * @since 1.0.0
 */
import * as Reactivity from '@effect/experimental/Reactivity'
import * as Client from '@effect/sql/SqlClient'
import type { Connection } from '@effect/sql/SqlConnection'
import { SqlError } from '@effect/sql/SqlError'
import type { Custom, Fragment, Primitive } from '@effect/sql/Statement'
import * as Statement from '@effect/sql/Statement'
import { SQL } from 'bun'
import * as Chunk from 'effect/Chunk'
import * as Config from 'effect/Config'
import type { ConfigError } from 'effect/ConfigError'
import * as Context from 'effect/Context'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import type * as Scope from 'effect/Scope'
import * as Stream from 'effect/Stream'

const ATTR_DB_SYSTEM_NAME = 'db.system.name'
const ATTR_DB_NAMESPACE = 'db.namespace'
const ATTR_SERVER_ADDRESS = 'server.address'
const ATTR_SERVER_PORT = 'server.port'

/**
 * @category type ids
 * @since 1.0.0
 */
export const TypeId: unique symbol = Symbol.for('@openfaith/sql-pg-bun/PgClient')

/**
 * @category type ids
 * @since 1.0.0
 */
export type TypeId = typeof TypeId

/**
 * @category models
 * @since 1.0.0
 */
export interface PgClient extends Client.SqlClient {
  readonly [TypeId]: TypeId
  readonly config: PgClientConfig
  readonly json: (_: unknown) => Fragment
  readonly array: (_: ReadonlyArray<Primitive>) => Fragment
  readonly listen: (channel: string) => Stream.Stream<string, SqlError>
  readonly notify: (channel: string, payload: string) => Effect.Effect<void, SqlError>
}

/**
 * @category tags
 * @since 1.0.0
 */
export const PgClient = Context.GenericTag<PgClient>('@openfaith/sql-pg-bun/PgClient')

/**
 * @category constructors
 * @since 1.0.0
 */
export interface PgClientConfig {
  readonly url?: Redacted.Redacted | undefined

  readonly hostname?: string | undefined
  readonly host?: string | undefined
  readonly port?: number | undefined
  readonly ssl?: boolean | undefined
  readonly database?: string | undefined
  readonly username?: string | undefined
  readonly user?: string | undefined
  readonly password?: Redacted.Redacted | undefined

  readonly idleTimeout?: Duration.DurationInput | undefined
  readonly connectTimeout?: Duration.DurationInput | undefined
  readonly queryTimeout?: Duration.DurationInput | undefined

  readonly maxConnections?: number | undefined
  readonly connectionTTL?: Duration.DurationInput | undefined

  readonly spanAttributes?: Record<string, unknown> | undefined

  readonly transformResultNames?: ((str: string) => string) | undefined
  readonly transformQueryNames?: ((str: string) => string) | undefined
  readonly transformJson?: boolean | undefined

  readonly onconnect?: ((client: SQL) => void) | undefined
  readonly onclose?: ((client: SQL) => void) | undefined
}

/**
 * @category constructors
 * @since 1.0.0
 */
export const make = (
  options: PgClientConfig,
): Effect.Effect<PgClient, SqlError, Scope.Scope | Reactivity.Reactivity> =>
  Effect.gen(function* () {
    const compiler = makeCompiler(options.transformQueryNames, options.transformJson)
    const transformRows = options.transformResultNames
      ? Statement.defaultTransforms(options.transformResultNames, options.transformJson).array
      : undefined

    // Build Bun SQL connection string or options
    // Build connection configuration for span attributes
    const connectionConfig = {
      database: options.database || 'postgres',
      hostname: options.hostname || options.host || 'localhost',
      password: options.password ? Redacted.value(options.password) : undefined,
      port: options.port || 5432,
      username: options.username || options.user,
    }

    const client = options.url
      ? new SQL(Redacted.value(options.url))
      : new SQL({
          connectionTimeout: options.connectTimeout
            ? Math.round(Duration.toMillis(Duration.decode(options.connectTimeout)) / 1000)
            : 30,
          database: connectionConfig.database,
          hostname: connectionConfig.hostname,
          idleTimeout: options.idleTimeout
            ? Math.round(Duration.toMillis(Duration.decode(options.idleTimeout)) / 1000)
            : 30,
          max: options.maxConnections || 10,
          password: connectionConfig.password,
          port: connectionConfig.port,
          tls: options.ssl || false,
          username: connectionConfig.username,
        })

    yield* Effect.acquireRelease(
      Effect.tryPromise({
        catch: (cause) => new SqlError({ cause, message: 'PgClient: Failed to connect' }),
        try: () => client`SELECT 1 as test`,
      }),
      () =>
        Effect.tryPromise({
          catch: () =>
            new SqlError({
              cause: new Error('Failed to close connection'),
              message: 'PgClient: Failed to close',
            }),
          try: () => client.end?.() ?? Promise.resolve(),
        }).pipe(
          Effect.timeout('1 second'),
          Effect.orElse(() => Effect.void),
        ),
    ).pipe(
      Effect.timeoutFail({
        duration: options.connectTimeout ?? Duration.seconds(5),
        onTimeout: () =>
          new SqlError({
            cause: new Error('Connection timed out'),
            message: 'PgClient: Connection timed out',
          }),
      }),
    )

    class ConnectionImpl implements Connection {
      constructor(private readonly sql: SQL) {}

      private run(query: Promise<any>) {
        return Effect.tryPromise({
          catch: (cause) => new SqlError({ cause, message: 'Failed to execute statement' }),
          try: () => query,
        })
      }

      execute(
        sql: string,
        params: ReadonlyArray<Primitive>,
        transformRows: (<A extends object>(row: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined,
      ) {
        const result = this.run(this.sql.unsafe(sql, params as any))
        return transformRows ? Effect.map(result, transformRows) : result
      }

      executeRaw(sql: string, params: ReadonlyArray<Primitive>) {
        return this.run(this.sql.unsafe(sql, params as any))
      }

      executeWithoutTransform(sql: string, params: ReadonlyArray<Primitive>) {
        return this.run(this.sql.unsafe(sql, params as any))
      }

      executeValues(sql: string, params: ReadonlyArray<Primitive>) {
        return this.run(this.sql.unsafe(sql, params as any))
      }

      executeUnprepared(
        sql: string,
        params: ReadonlyArray<Primitive>,
        transformRows: (<A extends object>(row: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined,
      ) {
        return this.execute(sql, params, transformRows)
      }

      executeStream(
        sql: string,
        params: ReadonlyArray<Primitive>,
        transformRows: (<A extends object>(row: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined,
      ) {
        // Bun SQL doesn't have cursor support like postgres.js, so we'll simulate it
        return Stream.fromEffect(this.execute(sql, params, transformRows)).pipe(
          Stream.mapChunks((rows) => Chunk.fromIterable(Array.isArray(rows) ? rows : [rows])),
        )
      }
    }

    // Extract config for span attributes
    const resolvedHost =
      typeof connectionConfig === 'string' ? 'localhost' : connectionConfig.hostname || 'localhost'
    const resolvedPort = typeof connectionConfig === 'string' ? 5432 : connectionConfig.port || 5432
    const resolvedDatabase =
      typeof connectionConfig === 'string' ? 'postgres' : connectionConfig.database || 'postgres'
    const resolvedUsername =
      typeof connectionConfig === 'string' ? undefined : connectionConfig.username

    return Object.assign(
      yield* Client.make({
        acquirer: Effect.succeed(new ConnectionImpl(client)),
        compiler,
        spanAttributes: [
          ...(options.spanAttributes ? Object.entries(options.spanAttributes) : []),
          [ATTR_DB_SYSTEM_NAME, 'postgresql'],
          [ATTR_DB_NAMESPACE, resolvedDatabase],
          [ATTR_SERVER_ADDRESS, resolvedHost],
          [ATTR_SERVER_PORT, resolvedPort],
        ],
        transactionAcquirer: Effect.gen(function* () {
          // For now, we'll use the same connection for transactions
          // In a production implementation, you might want to use BEGIN/COMMIT/ROLLBACK
          return new ConnectionImpl(client)
        }),
        transformRows,
      }),
      {
        [TypeId]: TypeId as TypeId,
        array: (_: ReadonlyArray<Primitive>) => PgArray(_),
        config: {
          ...options,
          database: resolvedDatabase,
          host: resolvedHost,
          password:
            typeof connectionConfig === 'string'
              ? undefined
              : connectionConfig.password
                ? Redacted.make(connectionConfig.password)
                : undefined,
          port: resolvedPort,
          username: resolvedUsername,
        },
        json: (_: unknown) => PgJson(_),
        listen: (channel: string) =>
          Stream.asyncPush<string, SqlError>((emit) =>
            Effect.acquireRelease(
              Effect.tryPromise({
                catch: (cause) => new SqlError({ cause, message: 'Failed to listen' }),
                try: async () => {
                  // Basic LISTEN implementation for PostgreSQL
                  // Use template literal interpolation for channel name
                  await client.unsafe(`LISTEN ${channel}`)

                  // For now, this is a simplified implementation
                  // In practice, you'd want to poll for notifications
                  const interval = setInterval(async () => {
                    try {
                      // Check for notifications (this is simplified)
                      const result = await client`SELECT 1`
                      if (result.length > 0) {
                        emit.single(`notification from ${channel}`)
                      }
                    } catch (error) {
                      emit.fail(new SqlError({ cause: error, message: 'Listen failed' }))
                    }
                  }, 1000)

                  return { stop: () => clearInterval(interval) }
                },
              }),
              ({ stop }) => Effect.sync(stop),
            ),
          ),
        notify: (channel: string, payload: string) =>
          Effect.tryPromise({
            catch: (cause) => new SqlError({ cause, message: 'Failed to notify' }),
            try: () => client`SELECT pg_notify(${channel}, ${payload})`,
          }).pipe(Effect.asVoid),
      },
    )
  })

/**
 * @category layers
 * @since 1.0.0
 */
export const layerConfig = (
  config: Config.Config.Wrap<PgClientConfig>,
): Layer.Layer<PgClient | Client.SqlClient, ConfigError | SqlError> =>
  Layer.scopedContext(
    Config.unwrap(config).pipe(
      Effect.flatMap(make),
      Effect.map((client) =>
        Context.make(PgClient, client).pipe(Context.add(Client.SqlClient, client)),
      ),
    ),
  ).pipe(Layer.provide(Reactivity.layer))

/**
 * @category layers
 * @since 1.0.0
 */
export const layer = (
  config: PgClientConfig,
): Layer.Layer<PgClient | Client.SqlClient, ConfigError | SqlError> =>
  Layer.scopedContext(
    Effect.map(make(config), (client) =>
      Context.make(PgClient, client).pipe(Context.add(Client.SqlClient, client)),
    ),
  ).pipe(Layer.provide(Reactivity.layer))

/**
 * @category constructor
 * @since 1.0.0
 */
export const makeCompiler = (
  transform?: (_: string) => string,
  transformJson = true,
): Statement.Compiler => {
  const transformValue =
    transformJson && transform ? Statement.defaultTransforms(transform).value : undefined

  return Statement.makeCompiler<PgCustom>({
    dialect: 'pg',
    onCustom(type, placeholder, withoutTransform) {
      switch (type.kind) {
        case 'PgJson': {
          return [
            placeholder(undefined),
            [withoutTransform || transformValue === undefined ? type.i0 : transformValue(type.i0)],
          ]
        }
        case 'PgArray': {
          return [placeholder(undefined), [type.i0]]
        }
      }
    },
    onIdentifier: transform
      ? (value, withoutTransform) => (withoutTransform ? escape(value) : escape(transform(value)))
      : escape,
    onRecordUpdate(placeholders, valueAlias, valueColumns, values, returning) {
      return [
        `(values ${placeholders}) AS ${valueAlias}${valueColumns}${returning ? ` RETURNING ${returning[0]}` : ''}`,
        returning ? values.flat().concat(returning[1]) : values.flat(),
      ]
    },
    placeholder(_) {
      return `$${_}`
    },
  })
}

const escape = Statement.defaultEscape('"')

/**
 * @category custom types
 * @since 1.0.0
 */
export type PgCustom = PgJson | PgArray

/**
 * @category custom types
 * @since 1.0.0
 */
interface PgJson extends Custom<'PgJson', unknown> {}
/**
 * @category custom types
 * @since 1.0.0
 */
const PgJson = Statement.custom<PgJson>('PgJson')

/**
 * @category custom types
 * @since 1.0.0
 */
interface PgArray extends Custom<'PgArray', ReadonlyArray<Primitive>> {}
/**
 * @category custom types
 * @since 1.0.0
 */
const PgArray = Statement.custom<PgArray>('PgArray')
