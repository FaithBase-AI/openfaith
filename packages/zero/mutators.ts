import { discoverUiEntities, type EntityUiConfig, enrichMutationData } from '@openfaith/schema'
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
  input: Schema.Array(Schema.Unknown),
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
}) {
  const { tx, input, entity, operation, orgId, userId } = params

  const tableName = pluralize(entity.tag)

  yield* Effect.log(`Processing ${operation} for ${entity.tag}`, {
    itemCount: input.length,
    orgId,
    tableName,
    userId,
  })

  const validatedInput = yield* enrichMutationData({
    data: input,
    entityType: entity.tag,
    operation,
    orgId,
    schema: entity.schema,
    userId,
  })

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
        try: async () => tx.mutate[tableName as keyof typeof tx.mutate][operation](input),
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

const validateAuth = (authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined) => {
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
    userId: authData.sub,
  }
}

export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
): CustomMutatorDefs<ZSchema> {
  const entities = discoverUiEntities()

  const mutators: CustomMutatorDefs<ZSchema> = {}

  for (const entity of entities) {
    const tableName = pluralize(entity.tag)

    mutators[tableName] = {
      delete: async (tx: Transaction<ZSchema>, input: Array<any>) => {
        const { orgId, userId } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'delete',
          orgId,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
      insert: async (tx: Transaction<ZSchema>, input: Array<any>) => {
        const { orgId, userId } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'insert',
          orgId,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
      update: async (tx: Transaction<ZSchema>, input: Array<any>) => {
        const { orgId, userId } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'update',
          orgId,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
      upsert: async (tx: Transaction<ZSchema>, input: Array<any>) => {
        const { orgId, userId } = validateAuth(authData)

        await effectMutator({
          entity,
          input,
          operation: 'upsert',
          orgId,
          tx,
          userId,
        }).pipe(Effect.runPromise)
      },
    }
  }
  return mutators
}

export type Mutators = ReturnType<typeof createMutators>
