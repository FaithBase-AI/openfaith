import { Atom, Result, useAtom } from '@effect-atom/atom-react'
import { impersonateUserE } from '@openfaith/auth/authClientE'
import { Button, ColumnHeader, CopyButton, getUserNameColumn } from '@openfaith/ui'
import { getBaseUsersQuery } from '@openfaith/zero/baseQueries'
import type { UserClientShape } from '@openfaith/zero/clientShapes'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import type { ColumnDef } from '@tanstack/react-table'
import type { FC } from 'react'

export const usersTableColumns: Array<ColumnDef<UserClientShape>> = [
  getUserNameColumn(),
  {
    accessorKey: 'id',
    cell: ({ row }) => (
      <>
        <span className='mr-auto text-xs'>{row.original.id}</span>
        <CopyButton value={row.original.id} />
      </>
    ),
    enableResizing: false,
    header: ({ column }) => <ColumnHeader column={column}>Id</ColumnHeader>,
    id: `idColumn`,
    size: 256,
  },
  {
    accessorFn: (row) => row.id,
    cell: ({ row }) => <ImpersonateButton userId={row.original.id} />,
    header: ({ column }) => <ColumnHeader column={column}>Actions</ColumnHeader>,
    id: 'actions',
    minSize: 144,
    size: 256,
  },
]

// Create an atom function for impersonation
const impersonateAtom = Atom.fn(impersonateUserE)

type ImpersonateButtonProps = {
  userId: string
}

const ImpersonateButton: FC<ImpersonateButtonProps> = (props) => {
  const { userId } = props
  const [impersonateResult, impersonateSet] = useAtom(impersonateAtom)

  return (
    <Button
      loading={Result.isWaiting(impersonateResult)}
      onClick={() => {
        impersonateSet({ userId })
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
