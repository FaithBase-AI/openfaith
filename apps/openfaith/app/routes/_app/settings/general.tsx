import { CurrentOrgWrapper, useOrgOpt } from '@openfaith/openfaith/data/orgs/orgData.app'
import { OrgForm } from '@openfaith/openfaith/features/auth/orgForm'
import { nullOp } from '@openfaith/shared'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyDetails,
  ScrollArea,
} from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Option, pipe } from 'effect'

export const Route = createFileRoute('/_app/settings/general')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orgOpt } = useOrgOpt()

  return (
    <ScrollArea viewportClassName='px-6 pb-6'>
      <div className='flex flex-col gap-4'>
        {pipe(
          orgOpt,
          Option.match({
            onNone: nullOp,
            onSome: (org) => <OrgForm _tag='edit' display='card' org={org} />,
          }),
        )}

        <Card>
          <CardHeader>
            <CardTitle>Technical</CardTitle>
            <CardDescription>
              Little details you might need when interacting with support.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex'>
            <CurrentOrgWrapper>
              {(org) => <CopyDetails Label={'Org Id'} value={org.id} />}
            </CurrentOrgWrapper>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
