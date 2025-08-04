import { UsersTable } from '@openfaith/openfaith/features/admin/usersTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UsersTable />
}
