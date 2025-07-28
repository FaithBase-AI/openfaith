'use client'

import {
  usersFiltersDef,
  usersTableColumns,
  useUsersCollection,
} from '@openfaith/openfaith/data/users/usersData.app'
import { InviteMemberButton } from '@openfaith/openfaith/features/settings/inviteMemberButton'
import { type Card, Collection } from '@openfaith/ui'
import type { UserClientShape } from '@openfaith/zero'
import type { FC } from 'react'

export const UsersTable: FC = () => {
  const { usersCollection, nextPage, pageSize, limit } = useUsersCollection()

  return (
    <Collection<UserClientShape, typeof Card>
      _tag={'users'}
      Actions={<InviteMemberButton size='sm' variant={'secondary'} />}
      columnsDef={usersTableColumns}
      data={usersCollection}
      filterColumnId={'email'}
      filterKey={'user-filters'}
      filterPlaceHolder={'Filter Members'}
      filtersDef={usersFiltersDef}
      limit={limit}
      nextPage={nextPage}
      pageSize={pageSize}
    />
  )
}
