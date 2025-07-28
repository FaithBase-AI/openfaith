import { OrgUsersTable } from '@openfaith/openfaith/features/settings/orgUsersTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/team')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-1 flex-col p-6'>
      <OrgUsersTable />
    </div>
  )
}
