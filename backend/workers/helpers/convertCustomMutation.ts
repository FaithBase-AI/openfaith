import type { CRUDMutation, CRUDOp, CustomMutation } from '@openfaith/domain'
import { Array, Effect, Option, pipe, Schema } from 'effect'

// Define tagged errors for custom mutation conversion
export class InvalidMutationNameError extends Schema.TaggedError<InvalidMutationNameError>()(
  'InvalidMutationNameError',
  {
    mutationName: Schema.String,
    reason: Schema.String,
  },
) {}

export class UnsupportedOperationError extends Schema.TaggedError<UnsupportedOperationError>()(
  'UnsupportedOperationError',
  {
    mutationName: Schema.String,
    operation: Schema.String,
  },
) {}

export class InvalidMutationDataError extends Schema.TaggedError<InvalidMutationDataError>()(
  'InvalidMutationDataError',
  {
    mutationName: Schema.String,
    reason: Schema.String,
  },
) {}

// Type for the converted entity workflow item
export type EntityWorkflowItem = {
  readonly entityName: string
  readonly mutation: CRUDMutation
  readonly op: CRUDOp
}

/**
 * Creates a CRUD operation based on the operation type
 */
const createCrudOperation = (
  operation: string,
  tableName: string,
  primaryKey: Record<string, unknown>,
  dataRecord: Record<string, unknown>,
  mutationName: string,
): Effect.Effect<CRUDOp, UnsupportedOperationError, never> =>
  Effect.gen(function* () {
    switch (operation) {
      case 'update':
        return {
          op: 'update' as const,
          primaryKey,
          tableName,
          value: dataRecord,
        }
      case 'create':
      case 'insert':
        return {
          op: 'insert' as const,
          primaryKey,
          tableName,
          value: dataRecord,
        }
      case 'delete':
        return {
          op: 'delete' as const,
          primaryKey,
          tableName,
          value: primaryKey, // For delete, value is the primary key
        }
      case 'upsert':
        return {
          op: 'upsert' as const,
          primaryKey,
          tableName,
          value: dataRecord,
        }
      default:
        return yield* Effect.fail(
          new UnsupportedOperationError({
            mutationName,
            operation,
          }),
        )
    }
  })

/**
 * Converts a custom mutation to CRUD mutation and operation
 * Uses Effect primitives for error handling and immutable operations
 */
export const convertCustomMutationToCrudMutation = (
  mutation: CustomMutation,
): Effect.Effect<
  ReadonlyArray<EntityWorkflowItem>,
  InvalidMutationNameError | UnsupportedOperationError | InvalidMutationDataError,
  never
> =>
  Effect.gen(function* () {
    // Parse entity name and operation from mutation name (e.g., "people|update")
    const nameParts = mutation.name.split('|')

    if (nameParts.length !== 2) {
      return yield* Effect.fail(
        new InvalidMutationNameError({
          mutationName: mutation.name,
          reason: 'Mutation name must be in format "entity|operation"',
        }),
      )
    }

    const [entityName, operation] = nameParts

    if (!entityName || !operation) {
      return yield* Effect.fail(
        new InvalidMutationNameError({
          mutationName: mutation.name,
          reason: 'Entity name and operation cannot be empty',
        }),
      )
    }

    // Get the first argument which should contain the data
    const mutationDataOpt = pipe(mutation.args, Array.head)

    if (Option.isNone(mutationDataOpt)) {
      return yield* Effect.fail(
        new InvalidMutationDataError({
          mutationName: mutation.name,
          reason: 'Mutation must have at least one argument',
        }),
      )
    }

    const mutationData = mutationDataOpt.value

    // Validate that mutationData is an object
    if (typeof mutationData !== 'object' || mutationData === null || Array.isArray(mutationData)) {
      return yield* Effect.fail(
        new InvalidMutationDataError({
          mutationName: mutation.name,
          reason: 'Mutation data must be a non-null object',
        }),
      )
    }

    const dataRecord = mutationData as Record<string, unknown>

    // Validate that the data has an ID for operations that need it
    if (!('id' in dataRecord) || typeof dataRecord.id !== 'string') {
      return yield* Effect.fail(
        new InvalidMutationDataError({
          mutationName: mutation.name,
          reason: 'Mutation data must contain a string "id" field',
        }),
      )
    }

    // Convert to appropriate CRUD operation based on the operation type
    const tableName = entityName // e.g., "people"

    // Create PrimaryKey in the correct format (Record<string, unknown>)
    const primaryKey = { id: dataRecord.id } as Record<string, unknown>

    // Create CRUD operation based on operation type
    const crudOp = yield* createCrudOperation(
      operation,
      tableName,
      primaryKey,
      dataRecord,
      mutation.name,
    )

    // Create a CRUD mutation structure that matches the expected schema
    const crudMutation: CRUDMutation = {
      args: [{ ops: [crudOp] }],
      clientID: mutation.clientID,
      id: mutation.id,
      name: '_zero_crud',
      timestamp: mutation.timestamp,
      type: 'crud',
    }

    return [
      {
        entityName,
        mutation: crudMutation,
        op: crudOp,
      },
    ]
  })

/**
 * Converts multiple custom mutations to entity workflow items
 */
export const convertCustomMutations = (
  mutations: ReadonlyArray<CustomMutation>,
): Effect.Effect<ReadonlyArray<EntityWorkflowItem>, never, never> =>
  Effect.gen(function* () {
    const results = yield* Effect.forEach(mutations, (mutation) =>
      convertCustomMutationToCrudMutation(mutation).pipe(
        Effect.tapError((error) =>
          Effect.logWarning('Failed to convert custom mutation', {
            error: error.message,
            mutationName: mutation.name,
          }),
        ),
        Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<EntityWorkflowItem>)),
      ),
    )

    return pipe(results, Array.flatten)
  })
