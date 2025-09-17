import { OrgsTable } from '@openfaith/openfaith/features/admin/orgsTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/orgs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OrgsTable />
}
