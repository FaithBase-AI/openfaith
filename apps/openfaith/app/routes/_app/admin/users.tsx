import { UsersTable } from '@openfaith/openfaith/features/admin/usersTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-1 flex-col p-6'>
      <UsersTable />
    </div>
  )
}
