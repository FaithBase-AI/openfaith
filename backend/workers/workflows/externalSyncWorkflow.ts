import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { Activity, Workflow } from '@effect/workflow'
import { AdapterManager, subscribeToWebhooks, TokenKey } from '@openfaith/adapter-core/server'
import { edgesTable, emailsTable, peopleTable, usersTable } from '@openfaith/db'
import { PcoAdapterManagerLayer } from '@openfaith/pco/server'
import { InternalManagerLive } from '@openfaith/server'
import { EdgeDirectionSchema } from '@openfaith/shared/schema'
import { ExternalSyncEntityWorkflow } from '@openfaith/workers/workflows/externalSyncEntityWorkflow'
import { eq } from 'drizzle-orm'
import { Array, Effect, Layer, Option, pipe, Record, Schema } from 'effect'

// Define the internal sync error
class ExternalSyncError extends Schema.TaggedError<ExternalSyncError>()('ExternalSyncError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

// Define the workflow payload schema
const ExternalSyncPayload = Schema.Struct({
  adapter: Schema.String,
  tokenKey: Schema.String,
  userId: Schema.String.pipe(Schema.optional),
})

// Define the internal sync workflow
export const ExternalSyncWorkflow = Workflow.make({
  error: ExternalSyncError,
  idempotencyKey: ({ tokenKey, adapter }) =>
    `internal-sync-${adapter}-${tokenKey}-${new Date().toISOString()}`,
  name: 'ExternalSyncWorkflow',
  payload: ExternalSyncPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalSyncWorkflowLayer = ExternalSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting internal sync workflow for adapter: ${payload.adapter}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, adapter, userId } = payload

    // For now, hardcode PCO like the external workflows do
    // TODO: Make this dynamic once we have more adapters
    if (adapter !== 'pco') {
      return yield* Effect.fail(
        new ExternalSyncError({
          message: `Adapter not supported: ${adapter}. Only 'pco' is currently supported.`,
        }),
      )
    }

    yield* Activity.make({
      error: ExternalSyncError,
      execute: subscribeToWebhooks().pipe(
        Effect.provide(Layer.mergeAll(PcoAdapterManagerLayer, InternalManagerLive)),
        Effect.provideService(TokenKey, tokenKey),
        Effect.catchTags({
          AdapterWebhookSubscriptionError: (error) =>
            Effect.fail(new ExternalSyncError({ message: error.message })),
        }),
      ),
      name: 'SubscribeToWebhooks',
    }).pipe(Activity.retry({ times: 3 }))

    const adapterManager = yield* AdapterManager.pipe(
      Effect.provide(PcoAdapterManagerLayer),
      Effect.provideService(TokenKey, tokenKey),
    )

    const entityManifest = adapterManager.getEntityManifest()

    // Filter entities that support sync (have list endpoints and skipSync is false)
    const syncEntities = pipe(
      entityManifest,
      Record.values,
      Array.filterMap((entity) => {
        if ('list' in entity.endpoints && entity.skipSync === false) {
          return Option.some(entity.entity)
        }

        return Option.none()
      }),
    )

    yield* Effect.logInfo('Discovered entities for sync', {
      adapter,
      entities: syncEntities,
      entityCount: syncEntities.length,
    })

    // Process each entity using the internal sync entity workflow
    yield* Effect.forEach(
      syncEntities,
      (entity) =>
        ExternalSyncEntityWorkflow.execute({ adapter, entity, tokenKey }).pipe(
          Effect.mapError((err) => new ExternalSyncError({ message: err.message })),
        ),
      { concurrency: 1 }, // Process entities sequentially to avoid overwhelming the external API
    )

    yield* Activity.make({
      error: ExternalSyncError,
      execute: mapUserToPerson({ orgId: tokenKey, userId }),
      name: 'MapUserToPerson',
    }).pipe(Activity.retry({ times: 3 }))

    yield* Effect.log(`✅ Completed internal sync workflow for adapter: ${adapter}`)
  }),
)

const mapUserToPerson = Effect.fn('mapUserToPerson')(function* (params: {
  userId?: string
  orgId: string
}) {
  const { userId, orgId } = params

  if (userId) {
    const db = yield* PgDrizzle.PgDrizzle

    const userEmail = yield* db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .pipe(
        Effect.mapError(
          (error) =>
            new ExternalSyncError({
              cause: error,
              message: `Failed to get user email for user: ${userId}`,
            }),
        ),
        Effect.map((x) =>
          pipe(
            x,
            Array.head,
            Option.map((y) => y.email),
            Option.getOrElse(() => ''),
          ),
        ),
      )

    const personIdOpt = yield* db
      .select({
        personId: peopleTable.id,
      })
      .from(emailsTable)
      .leftJoin(edgesTable, eq(emailsTable.id, edgesTable.sourceEntityId))
      .leftJoin(peopleTable, eq(edgesTable.targetEntityId, peopleTable.id))
      .where(eq(emailsTable.address, userEmail))
      .pipe(
        Effect.mapError(
          (error) =>
            new ExternalSyncError({
              cause: error,
              message: `Failed to get person id for user: ${userId}`,
            }),
        ),
        Effect.map((x) =>
          pipe(
            x,
            Array.head,
            Option.flatMapNullable((y) => y.personId),
          ),
        ),
      )

    if (Option.isSome(personIdOpt)) {
      const direction = Schema.decodeUnknownSync(EdgeDirectionSchema)({
        idA: userId,
        idB: personIdOpt.value,
      })

      const createdAt = new Date()

      yield* db
        .insert(edgesTable)
        .values({
          _tag: 'edge',
          createdAt,
          metadata: {
            linkedAt: createdAt.toISOString(),
          },
          orgId,
          relationshipType: 'user-is-person',
          sourceEntityId: direction.source,
          sourceEntityTypeTag: direction.source.startsWith('user') ? 'user' : 'person',
          targetEntityId: direction.target,
          targetEntityTypeTag: direction.target.startsWith('user') ? 'user' : 'person',
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new ExternalSyncError({
                cause: error,
                message: `Failed to create user-is-person edge for user: ${userId} ${personIdOpt.value}`,
              }),
          ),
        )
    }
  }
})
