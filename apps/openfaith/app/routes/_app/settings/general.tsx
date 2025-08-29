import { useOrgOpt } from '@openfaith/openfaith/data/orgs/orgData.app'
import { OrgForm } from '@openfaith/openfaith/features/auth/orgForm'
import { nullOp } from '@openfaith/shared'
import { ScrollArea } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Option, pipe } from 'effect'

export const Route = createFileRoute('/_app/settings/general')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orgOpt } = useOrgOpt()

  return (
    <ScrollArea viewportClassName='px-6 pb-6'>
      {pipe(
        orgOpt,
        Option.match({
          onNone: nullOp,
          onSome: (org) => <OrgForm _tag='edit' display='card' org={org} />,
        }),
      )}
    </ScrollArea>
  )
}
