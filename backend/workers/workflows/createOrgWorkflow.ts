import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { Activity, Workflow } from '@effect/workflow'
import { sacramentsTable } from '@openfaith/db'
import { updateEntityRelationshipsForOrgE } from '@openfaith/server'
import { getEntityId } from '@openfaith/shared'
import { eq } from 'drizzle-orm'
import { Array, Effect, Option, pipe, Schema } from 'effect'

class CreateOrgWorkflowError extends Schema.TaggedError<CreateOrgWorkflowError>()(
  'CreateOrgWorkflowError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

const CreateOrgPayload = Schema.Struct({
  name: Schema.String,
  organizationId: Schema.String,
  slug: Schema.String,
  userId: Schema.String,
})

export const CreateOrgWorkflow = Workflow.make({
  error: CreateOrgWorkflowError,
  idempotencyKey: ({ organizationId, userId }) =>
    `create-org-${organizationId}-${userId}-${new Date().toISOString()}`,
  name: 'CreateOrgWorkflow',
  payload: CreateOrgPayload,
  success: Schema.Void,
})

export const CreateOrgWorkflowLayer = CreateOrgWorkflow.toLayer(
  Effect.fn((payload, executionId) =>
    Effect.gen(function* () {
      yield* Effect.log('🏗️ CreateOrgWorkflow started', payload)
      yield* Effect.log(`🆔 Execution ID: ${executionId}`)

      const createdAt = new Date()

      // Create activity to seed default sacrament records for the org
      yield* Activity.make({
        error: CreateOrgWorkflowError,
        execute: Effect.gen(function* () {
          const db = yield* PgDrizzle.PgDrizzle

          // Get all sacraments for the org. We are doing it this way because the primaryKey is just the id. So we can't onConflictDoUpdate.
          const currentSacraments = yield* db
            .select({
              id: sacramentsTable.id,
              type: sacramentsTable.type,
            })
            .from(sacramentsTable)
            .where(eq(sacramentsTable.orgId, payload.organizationId))

          yield* db
            .insert(sacramentsTable)
            .values(
              pipe(
                ['salvation', 'baptismWater', 'baptismHolySpirit'],
                Array.map(
                  (sacramentType) =>
                    ({
                      _tag: 'sacrament',
                      createdAt,
                      createdBy: payload.userId,
                      id: pipe(
                        currentSacraments,
                        Array.findFirst((x) => x.type === sacramentType),
                        Option.match({
                          onNone: () => getEntityId('sacrament'),
                          onSome: (x) => x.id,
                        }),
                      ),
                      orgId: payload.organizationId,
                      type: sacramentType,
                    }) as const,
                ),
              ),
            )
            .onConflictDoUpdate({
              set: {
                updatedAt: createdAt,
                updatedBy: payload.userId,
              },
              target: [sacramentsTable.id],
            })
        }).pipe(
          Effect.catchTags({
            SqlError: (error) =>
              Effect.fail(
                new CreateOrgWorkflowError({
                  cause: error,
                  message: 'Failed to seed default sacraments',
                }),
              ),
          }),
        ),
        name: 'SeedDefaultSacraments',
      }).pipe(Activity.retry({ times: 3 }))

      // Create activity to seed entity relationship configuration for the org
      yield* Activity.make({
        error: CreateOrgWorkflowError,
        execute: updateEntityRelationshipsForOrgE({
          orgId: payload.organizationId,
          relationships: [
            {
              sourceEntityTypeTag: 'person',
              targetEntityTypeTags: ['person', 'phoneNumber', 'address', 'campus', 'user', 'email'],
            },
          ],
        }).pipe(
          Effect.catchTags({
            SqlError: (error) =>
              Effect.fail(
                new CreateOrgWorkflowError({
                  cause: error,
                  message: 'Failed to seed relationships',
                }),
              ),
          }),
        ),
        name: 'SeedEntityRelationships',
      }).pipe(Activity.retry({ times: 3 }))

      yield* Effect.log('✅ CreateOrgWorkflow finished')
    }),
  ),
)
