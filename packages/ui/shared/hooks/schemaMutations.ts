import { Atom, useAtom } from '@effect-atom/atom-react'
import { enrichMutationData } from '@openfaith/schema'
import { pluralize } from '@openfaith/shared'
import { useZero } from '@openfaith/zero/useZero'
import { Effect, Schema } from 'effect'
import { useMemo } from 'react'
import { toast } from 'sonner'

export class ClientMutationError extends Schema.TaggedError<ClientMutationError>()(
  'ClientMutationError',
  {
    cause: Schema.optional(Schema.Unknown),
    entityType: Schema.String,
    operation: Schema.Literal('insert', 'update', 'delete', 'upsert'),
  },
) {}

const zeroMutationE = (params: {
  z: ReturnType<typeof useZero>
  entityType: string
  operation: 'insert' | 'update' | 'delete' | 'upsert'
  parsedData: any
}) => {
  const { z, entityType, operation, parsedData } = params

  const tableName = pluralize(entityType)

  return Effect.tryPromise({
    catch: (cause) => new ClientMutationError({ cause, entityType, operation }),
    try: () => z.mutate[tableName as keyof typeof z.mutate][operation](parsedData),
  })
}

type SchemaMutationParams = {
  schema: Schema.Schema<any>
  data: Array<any>
  z: ReturnType<typeof useZero>
  userId: string
  orgId: string
  entityType: string
  operation: 'delete' | 'insert' | 'update' | 'upsert'
}

const successMessages = {
  delete: 'Deleted successfully!',
  insert: 'Created successfully!',
  update: 'Updated successfully!',
  upsert: 'Saved successfully!',
} as const

export const schemaMutationAtom = Atom.family((_key: string) => {
  return Atom.fn(
    Effect.fnUntraced(function* (params: SchemaMutationParams) {
      const { schema, data, z, userId, orgId, entityType, operation } = params

      // Build enriched data based on operation
      const parsedData = yield* enrichMutationData({
        data,
        entityType,
        operation,
        orgId,
        schema,
        userId,
      }).pipe(
        Effect.tapError((error) =>
          Effect.sync(() => toast.error(`Failed validating data: ${error.message}`)),
        ),
      )

      yield* zeroMutationE({ entityType, operation, parsedData: parsedData as any, z }).pipe(
        Effect.tapError((error) =>
          Effect.sync(() => toast.error(`Failed to ${operation}: ${error.message}`)),
        ),
        Effect.tap(() => Effect.sync(() => toast.success(successMessages[operation]))),
      )
    }),
  )
})

export const useSchemaInsert = <T>(params: {
  schema: Schema.Schema<T>
  orgId: string
  userId: string
  entityType: string
}) => {
  const { orgId, userId, schema, entityType } = params
  const z = useZero()

  const [result, insert] = useAtom(schemaMutationAtom(`${entityType}-insert`))

  const insertFn = useMemo(
    () => (data: Array<Partial<T>>) => {
      insert({ data, entityType, operation: 'insert', orgId, schema, userId, z })
    },
    [insert, entityType, orgId, schema, userId, z],
  )

  return [result, insertFn] as const
}

export const useSchemaUpdate = <T>(params: {
  schema: Schema.Schema<T>
  orgId: string
  userId: string
  entityType: string
}) => {
  const { orgId, userId, schema, entityType } = params
  const z = useZero()

  const [result, update] = useAtom(schemaMutationAtom(`${entityType}-update`))

  const updateFn = useMemo(
    () => (data: Array<Partial<T> & { id: string }>) => {
      update({ data, entityType, operation: 'update', orgId, schema, userId, z })
    },
    [update, entityType, orgId, schema, userId, z],
  )

  return [result, updateFn] as const
}

export const useSchemaDelete = <T>(params: {
  schema: Schema.Schema<T>
  orgId: string
  userId: string
  entityType: string
}) => {
  const { orgId, userId, schema, entityType } = params
  const z = useZero()

  const [result, deleteEntity] = useAtom(schemaMutationAtom(`${entityType}-delete`))

  const deleteFn = useMemo(
    () => (data: Array<{ id: string }>) => {
      deleteEntity({ data, entityType, operation: 'delete', orgId, schema, userId, z })
    },
    [deleteEntity, entityType, orgId, schema, userId, z],
  )

  return [result, deleteFn] as const
}

export const useSchemaUpsert = <T>(params: {
  schema: Schema.Schema<T>
  orgId: string
  userId: string
  entityType: string
}) => {
  const { orgId, userId, schema, entityType } = params
  const z = useZero()

  const [result, upsert] = useAtom(schemaMutationAtom(`${entityType}-upsert`))

  const upsertFn = useMemo(
    () => (data: Array<Partial<T>>) => {
      upsert({ data, entityType, operation: 'upsert', orgId, schema, userId, z })
    },
    [upsert, entityType, orgId, schema, userId, z],
  )

  return [result, upsertFn] as const
}
