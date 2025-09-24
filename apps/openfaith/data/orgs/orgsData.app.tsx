import { Result, useAtom } from '@effect-atom/atom-react'
import { adminAdapterReSyncAtom } from '@openfaith/openfaith/data/rpcState'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import {
  Badge,
  Button,
  CheckCircleIcon,
  ColumnHeader,
  EntityIdBadges,
  getCreatedAtColumn,
  getNameColumn,
  useFilterQuery,
  XIcon,
} from '@openfaith/ui'
import { getBaseOrgsQuery, type OrgClientShape, useZero } from '@openfaith/zero'
import { useQuery } from '@rocicorp/zero/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, Option, pipe, String } from 'effect'
import type { FC } from 'react'

export const orgsTableColumns: Array<ColumnDef<OrgClientShape>> = [
  getNameColumn(),
  {
    accessorKey: 'id',
    enableResizing: false,
    header: ({ column }) => <ColumnHeader column={column}>Id</ColumnHeader>,
    size: 256,
  },
  {
    accessorFn: (row) => row.orgUsers.length,
    header: ({ column }) => <ColumnHeader column={column}>Total Members</ColumnHeader>,
    id: 'totalMembers',
    minSize: 144,
    size: 256,
  },
  {
    accessorKey: 'orgUsers',
    cell: ({ row }) => (
      <EntityIdBadges
        entityIds={pipe(
          row.original.orgUsers,
          Array.map((x) => x.userId),
        )}
        entityType='user'
      />
    ),
    header: ({ column }) => <ColumnHeader column={column}>Org Users</ColumnHeader>,
    id: 'orgUsers',
    minSize: 144,
    size: 256,
  },
  {
    accessorKey: 'adapterDetails',
    cell: ({ row }) =>
      pipe(
        row.original.adapterDetails,
        Array.map((x) => (
          <Badge key={x.adapter} variant='secondary'>
            {x.enabled ? <CheckCircleIcon /> : <XIcon />}
            {pipe(x.adapter, String.toUpperCase)}
          </Badge>
        )),
      ),
    header: ({ column }) => <ColumnHeader column={column}>Adapter Details</ColumnHeader>,
    id: 'adapterDetails',
    minSize: 144,
    size: 256,
  },
  getCreatedAtColumn(),
  {
    accessorFn: (row) => row.id,
    cell: ({ row }) => <ResyncButton orgId={row.original.id} />,
    header: ({ column }) => <ColumnHeader column={column}>Actions</ColumnHeader>,
    id: 'actions',
    minSize: 144,
    size: 256,
  },
]

type ResyncButtonProps = {
  orgId: string
}

const ResyncButton: FC<ResyncButtonProps> = (props) => {
  const { orgId } = props
  const [orgAdapterReSyncResult, orgAdapterReSyncSet] = useAtom(adminAdapterReSyncAtom)

  return (
    <Button
      loading={Result.isWaiting(orgAdapterReSyncResult)}
      onClick={() => orgAdapterReSyncSet({ adapter: 'pco', orgId })}
    >
      Resync PCO
    </Button>
  )
}

export const orgsFiltersDef = [] as const

export function useOrgsCollection() {
  const z = useZero()

  const userId = useUserId()

  const [orgsCollection, info] = useQuery(getBaseOrgsQuery(z), { ttl: '10m' })

  return {
    adminOrgsCollection: pipe(
      orgsCollection,
      Array.filter((x) =>
        pipe(
          x.orgUsers,
          Array.findFirst((y) => y.userId === userId),
          Option.isNone,
        ),
      ),
    ),
    loading: info.type !== 'complete',
    orgsCollection: pipe(
      orgsCollection,
      Array.filter((x) =>
        pipe(
          x.orgUsers,
          Array.findFirst((y) => y.userId === userId),
          Option.isSome,
        ),
      ),
    ),
  }
}

export function useAdminOrgsCollection() {
  return useFilterQuery({
    filterKey: 'admin-orgs',
    query: getBaseOrgsQuery,
  })
}
