import { useOrgOpt } from '@openfaith/openfaith/data/orgs/orgData.app'
import { OrgForm } from '@openfaith/openfaith/features/auth/orgForm'
import { nullOp } from '@openfaith/shared'

import { createFileRoute } from '@tanstack/react-router'
import { Option, pipe } from 'effect'

export const Route = createFileRoute('/_app/settings/general')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orgOpt } = useOrgOpt()

  return (
    <div className='flex flex-1 flex-col p-6'>
      {pipe(
        orgOpt,
        Option.match({
          onNone: nullOp,
          onSome: (org) => <OrgForm _tag='edit' org={org} />,
        }),
      )}
    </div>
  )
}
