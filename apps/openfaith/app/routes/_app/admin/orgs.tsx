import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/orgs')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col items-start'>
      <div className='p-6 text-muted-foreground'>
        Organization management features coming soon...
      </div>
    </div>
  )
}
