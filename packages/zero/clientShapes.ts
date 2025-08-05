import type { Resolve } from '@openfaith/shared'
import type {
  getBaseEntityRelationshipsQuery,
  getBaseOrgsQuery,
  getBaseOrgUsersQuery,
  getBaseUsersQuery,
} from '@openfaith/zero/baseQueries'
import type { Row } from '@rocicorp/zero'

export type UserClientShape = Resolve<Row<ReturnType<typeof getBaseUsersQuery>>>

export type OrgClientShape = Resolve<Row<ReturnType<typeof getBaseOrgsQuery>>>

export type OrgUserClientShape = Omit<
  Resolve<Row<ReturnType<typeof getBaseOrgUsersQuery>>>,
  'user'
> & {
  user: NonNullable<Resolve<Row<ReturnType<typeof getBaseOrgUsersQuery>>>['user']>
}

export type EntityRelationshipsClientShape = Resolve<
  Row<ReturnType<typeof getBaseEntityRelationshipsQuery>>
>
