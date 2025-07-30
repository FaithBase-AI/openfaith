import type { useZero } from '@openfaith/zero/useZero'
import type { TableMutator, TableSchema } from '@rocicorp/zero'
import { Schema } from 'effect'

export class EntityNotFoundError extends Schema.TaggedError<EntityNotFoundError>()(
  'EntityNotFoundError',
  {
    availableEntities: Schema.Array(Schema.String),
    entityName: Schema.String,
  },
) {}

// Users
export const getBaseUsersQuery = (z: ReturnType<typeof useZero>) => z.query.users
export const getBaseUserQuery = (z: ReturnType<typeof useZero>, userId: string) =>
  getBaseUsersQuery(z).where('id', userId).one()

// Orgs
export const getBaseOrgsQuery = (z: ReturnType<typeof useZero>) =>
  z.query.orgs.related('orgUsers').orderBy('name', 'asc')
export const getBaseOrgQuery = (z: ReturnType<typeof useZero>, orgId: string) =>
  getBaseOrgsQuery(z).where('id', orgId).one()

export const getBaseEntitiesQuery = (z: ReturnType<typeof useZero>, entityName: string) => {
  if (entityName in z.query) {
    return z.query[entityName as keyof typeof z.query]
  }

  throw new EntityNotFoundError({
    availableEntities: Object.keys(z.query),
    entityName,
  })
}

export const getBaseEntityQuery = (
  z: ReturnType<typeof useZero>,
  entityName: string,
  entityId: string,
) => {
  const entitiesQuery = getBaseEntitiesQuery(z, entityName)
  // @ts-expect-error - id is a valid field for all entities
  return entitiesQuery.where('id', entityId).one()
}

export const getBaseMutator = (
  z: ReturnType<typeof useZero>,
  entityName: string,
  operation: keyof TableMutator<TableSchema>,
) => {
  if (entityName in z.mutate) {
    return z.mutate[entityName as keyof typeof z.mutate]?.[operation]
  }

  throw new EntityNotFoundError({
    availableEntities: Object.keys(z.mutate),
    entityName,
  })
}
