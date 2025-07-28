import { Button, ColumnHeader, getIdColumn, getUserNameColumn } from '@openfaith/ui'
import { getBaseUsersQuery } from '@openfaith/zero/baseQueries'
import type { UserClientShape } from '@openfaith/zero/clientShapes'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import type { ColumnDef } from '@tanstack/react-table'
import type { FC } from 'react'

export const usersTableColumns: Array<ColumnDef<UserClientShape>> = [
  getIdColumn(),
  getUserNameColumn(),
  {
    accessorFn: (row) => row.id,
    cell: ({ row }) => {
      const user = row.original

      return <ImpersonateButton userId={user.id} />
    },
    header: ({ column }) => <ColumnHeader column={column}>Actions</ColumnHeader>,
    id: 'actions',
    minSize: 144,
    size: 256,
  },
]

const ImpersonateButton: FC<{ userId: string }> = (props) => {
  const { userId } = props

  return (
    <Button
      onClick={() => {
        // TODO: Implement impersonation when better-auth supports it
        console.log('Impersonate user:', userId)
      }}
      size='sm'
      variant='secondary'
    >
      Impersonate
    </Button>
  )
}

// Removed usersFiltersDef that used dtf
export const usersFiltersDef = [] as const

export function useUsersCollection() {
  const z = useZero()

  const [users, info] = useQuery(getBaseUsersQuery(z).where('isAnonymous', 'IS', null))

  return {
    limit: 100,
    loading: info.type !== 'complete',
    nextPage: () => {}, // TODO: Implement pagination
    pageSize: 20,
    usersCollection: (users || []) as Array<UserClientShape>,
  }
}
