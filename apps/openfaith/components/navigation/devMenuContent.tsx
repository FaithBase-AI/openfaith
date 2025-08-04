'use client'

import { authClient } from '@openfaith/auth/authClient'
import { useOrgId } from '@openfaith/openfaith/data/users/useOrgId'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { nullOp } from '@openfaith/shared'
import { Button } from '@openfaith/ui'
import { useRouter } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import type { FC } from 'react'

type DevMenuContentProps = {
  impersonatedBy?: string | null
}

export const DevMenuContent: FC<DevMenuContentProps> = (props) => {
  const { impersonatedBy } = props

  const orgId = useOrgId()
  const userId = useUserId()

  const router = useRouter()
  return (
    <div className='mb-2 flex flex-col gap-2 overflow-hidden text-muted-foreground/40 text-sm'>
      {pipe(
        impersonatedBy,
        Option.fromNullable,
        Option.match({
          onNone: nullOp,
          onSome: () => (
            <Button
              onClick={async () => {
                await authClient.admin.stopImpersonating()
                router.invalidate()
              }}
            >
              Clear Impersonation
            </Button>
          ),
        }),
      )}

      <p>{orgId}</p>
      <p>{userId}</p>
      {pipe(
        impersonatedBy,
        Option.fromNullable,
        Option.match({
          onNone: nullOp,
          onSome: (x) => <p>{x}</p>,
        }),
      )}
    </div>
  )
}
