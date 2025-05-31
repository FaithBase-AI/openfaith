import type { Resolve } from '@openfaith/shared'
import type { getBaseOrgsQuery, getBaseUsersQuery } from '@openfaith/zero/baseQueries'
import type { Row } from '@rocicorp/zero'

export type UserClientShape = Resolve<Row<ReturnType<typeof getBaseUsersQuery>>>

export type OrgClientShape = Resolve<Row<ReturnType<typeof getBaseOrgsQuery>>>

export type OrgUserClientShape = OrgClientShape['orgUsers'][number]
