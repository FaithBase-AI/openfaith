import type { useZero } from '@openfaith/zero/useZero'
import { schema } from '@openfaith/zero/zero-schema.gen'
import type { TableMutator, TableSchema } from '@rocicorp/zero'
import { Effect, Schema } from 'effect'

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

// OrgUsers
export const getBaseOrgUsersQuery = (z: ReturnType<typeof useZero>) =>
  z.query.orgUsers.whereExists('user').related('user')

export const getBaseOrgUserQuery = (z: ReturnType<typeof useZero>, userId: string) =>
  z.query.orgUsers.related('user').where('id', userId).one()

export const getBaseEntitiesQuery = (z: ReturnType<typeof useZero>, entityName: string) => {
  return Effect.gen(function* () {
    if (!(entityName in z.query)) {
      throw new EntityNotFoundError({
        availableEntities: Object.keys(z.query),
        entityName,
      })
    }

    const baseQuery = z.query[entityName as keyof typeof z.query]

    // Try to access the schema from the query object to check for relationships
    const queryWithSchema = baseQuery as any

    // Check if this entity has sourceEdges/targetEdges relationships in the schema
    const entityRelationships = (schema?.relationships as any)?.[entityName]
    const hasSourceEdges = entityRelationships?.sourceEdges
    const hasTargetEdges = entityRelationships?.targetEdges

    if (hasSourceEdges && hasTargetEdges) {
      // Add both edge relationships
      return queryWithSchema.related('sourceEdges').related('targetEdges')
    }

    if (hasSourceEdges) {
      // Add only sourceEdges relationship
      return queryWithSchema.related('sourceEdges')
    }

    if (hasTargetEdges) {
      // Add only targetEdges relationship
      return queryWithSchema.related('targetEdges')
    }

    // Return base query for entities without edge relationships
    return baseQuery
  }).pipe(Effect.runSync)
}
export const getBaseEntityQuery = (
  z: ReturnType<typeof useZero>,
  entityName: string,
  entityId: string,
) => {
  const entitiesQuery = getBaseEntitiesQuery(z, entityName)
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

export const getBaseEntityRelationshipsQuery = (z: ReturnType<typeof useZero>) =>
  z.query.entityRelationships
