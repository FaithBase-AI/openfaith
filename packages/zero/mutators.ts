import { discoverUiEntities, type EntityUiConfig, validateMutationData } from '@openfaith/schema'
import { pluralize } from '@openfaith/shared'
import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mjs'
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero'
import { Effect, type ParseResult, Schema } from 'effect'

export class MutatorAuthError extends Schema.TaggedError<MutatorAuthError>()('MutatorAuthError', {
  authData: Schema.Unknown,
  message: Schema.String,
}) {}

export class MutatorError extends Schema.TaggedError<MutatorError>()('MutatorError', {
  cause: Schema.optional(Schema.Unknown),
  input: Schema.Unknown,
  message: Schema.String,
  operation: Schema.Literal('delete', 'insert', 'update', 'upsert'),
  orgId: Schema.String,
  tableName: Schema.String,
  userId: Schema.String,
}) {}

export type MutationErrorTypes = MutatorError | MutatorAuthError | ParseResult.ParseError

const effectMutator = Effect.fn('effectMutator')(function* (params: {
  tx: Transaction<ZSchema>
  input: Array<any>
  entity: EntityUiConfig
  operation: 'delete' | 'insert' | 'update' | 'upsert'
  orgId: string
  userId: string
  role: 'admin' | 'user' | string
}) {
  const { tx, input, entity, operation, orgId, userId, role } = params

  const tableName = pluralize(entity.tag)

  yield* Effect.log(`Processing ${operation} for ${entity.tag}`, {
    itemCount: input.length,
    orgId,
    tableName,
    userId,
  })

  const validatedInput = yield* validateMutationData({
    data: input,
    operation,
    schema: entity.schema,
  })

  // We need to make sure that the mutation data matches the auth data.
  for (const item of validatedInput) {
    // If the user isn't an admin, we need to do the auth check.
    if (role !== 'admin' && (item.updatedBy !== userId || item.orgId !== orgId)) {
      yield* Effect.fail(
        new MutatorAuthError({
          authData: { orgId, userId },
          message: `Item, ${item.id}, doesn't have matching userId, ${item.updatedBy}, / orgId, ${item.orgId}, with authData.`,
        }),
      )
    }
  }

  yield* Effect.forEach(
    validatedInput,
    (input) =>
      Effect.tryPromise({
        catch: (error) =>
          new MutatorError({
            cause: error,
            input,
            message: `Failed to ${operation} on ${entity.tag}.`,
            operation,
            orgId,
            tableName,
            userId,
          }),
        try: async () => tx.mutate[tableName as keyof typeof tx.mutate][operation](input as any),
      }),
    {
      concurrency: 'unbounded',
    },
  )

  yield* Effect.log(`Successfully processed ${operation} for ${entity.tag}`, {
    itemCount: input.length,
    orgId,
    tableName,
    userId,
  })
})

const validateAuth = (
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId' | 'role'> | undefined,
) => {
  if (!authData) {
    throw new MutatorAuthError({
      authData,
      message: 'Not authenticated',
    })
  }

  if (!authData.activeOrganizationId) {
    throw new MutatorAuthError({
      authData,
      message: 'No active organization',
    })
  }

  return {
    orgId: authData.activeOrganizationId,
    role: authData.role,
    userId: authData.sub,
  }
}

export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId' | 'role'> | undefined,
): CustomMutatorDefs {
  const entities = discoverUiEntities()

  const mutators: CustomMutatorDefs = {}

  for (const entity of entities) {
    const tableName = pluralize(entity.tag)

    mutators[tableName] = {
      delete: async (tx, input: Array<any>) => {
        const { orgId, userId, role } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'delete',
          orgId,
          role,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
      insert: async (tx, input: Array<any>) => {
        const { orgId, userId, role } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'insert',
          orgId,
          role,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
      update: async (tx, input: Array<any>) => {
        const { orgId, userId, role } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'update',
          orgId,
          role,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
      upsert: async (tx, input: Array<any>) => {
        const { orgId, userId, role } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'upsert',
          orgId,
          role,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
    }
  }
  return mutators
}

export type Mutators = ReturnType<typeof createMutators>
