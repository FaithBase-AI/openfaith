import type { useZero } from '@openfaith/zero/useZero'

// Users
export const getBaseUsersQuery = (z: ReturnType<typeof useZero>) => z.query.users
export const getBaseUserQuery = (z: ReturnType<typeof useZero>, userId: string) =>
  getBaseUsersQuery(z).where('id', userId).one()

// Orgs
export const getBaseOrgsQuery = (z: ReturnType<typeof useZero>) =>
  z.query.orgs.related('orgUsers').orderBy('name', 'asc')
export const getBaseOrgQuery = (z: ReturnType<typeof useZero>, orgId: string) =>
  getBaseOrgsQuery(z).where('id', orgId).one()
