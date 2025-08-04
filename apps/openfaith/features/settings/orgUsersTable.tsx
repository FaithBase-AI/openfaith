'use client'

import { useOrgUsers } from '@openfaith/openfaith/data/orgs/orgData.app'
import { displayOrgRole, type OrgRole } from '@openfaith/openfaith/data/orgs/orgsShared'
import { InviteMemberButton } from '@openfaith/openfaith/features/settings/inviteMemberButton'
import { nullOp } from '@openfaith/shared'
import { Collection, ColumnHeader, getIdColumn, UserAvatar } from '@openfaith/ui'
import { createColumnConfigHelper } from '@openfaith/ui/components/data-table-filter/core/filters'
import type { Card } from '@openfaith/ui/components/ui/card'
import type { OrgUserClientShape } from '@openfaith/zero/clientShapes'
import type { ColumnDef } from '@tanstack/react-table'
import { SearchIcon, UserCircleIcon } from 'lucide-react'
import type { FC } from 'react'

const dtf = createColumnConfigHelper<OrgUserClientShape>()

const orgUsersTableColumns: Array<ColumnDef<OrgUserClientShape>> = [
  getIdColumn(),
  {
    accessorKey: 'name',
    cell: ({ row }) => {
      const orgUser = row.original
      return (
        <div className={'ml-0 flex items-center gap-3 pr-1 pl-0'}>
          <UserAvatar
            avatar={orgUser.user.image}
            name={orgUser.user.name}
            userId={orgUser.userId}
          />
          {orgUser.user.name}
        </div>
      )
    },
    header: ({ column }) => <ColumnHeader column={column}>Name</ColumnHeader>,
    minSize: 144,
    size: 256,
  },
  {
    accessorKey: 'role',
    cell: ({ row }) => (
      <span className={'ml-[13px]'}>{displayOrgRole[row.original.role as OrgRole]}</span>
    ),
    enableSorting: true,
    header: ({ column }) => <ColumnHeader column={column}>Role</ColumnHeader>,
    minSize: 144,
  },
]

const orgUsersFiltersDef = [
  dtf
    .text()
    .id('user.name')
    .accessor((x) => x.user.name)
    .displayName('Name')
    .icon(SearchIcon)
    .hidden()
    .build(),
  dtf
    .option()
    .id('role')
    .accessor((x) => x.role)
    .displayName('Role')
    .icon(UserCircleIcon)
    .options([
      {
        label: 'Owner',
        value: 'owner',
      },
      {
        label: 'Admin',
        value: 'admin',
      },
      {
        label: 'Member',
        value: 'member',
      },
    ])
    .build(),
] as const

export const OrgUsersTable: FC = () => {
  const { orgUsersCollection } = useOrgUsers()

  // Pagination defaults (org users are usually a small set)
  const pageSize = 50
  const limit = 50

  return (
    <Collection<OrgUserClientShape, typeof Card>
      _tag={'orgUsers'}
      Actions={<InviteMemberButton size={'sm'} variant={'secondary'} />}
      columnsDef={orgUsersTableColumns}
      data={orgUsersCollection}
      filterColumnId={'user.name'}
      filterKey={'orgUsers'}
      filterPlaceHolder={'Filter Members'}
      filtersDef={orgUsersFiltersDef}
      limit={limit}
      nextPage={nullOp}
      pageSize={pageSize}
    />
  )
}
