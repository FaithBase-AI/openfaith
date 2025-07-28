import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/integrations')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='p-6'>
      <h1 className='mb-4 font-bold text-2xl'>Integrations</h1>
      <p className='text-muted-foreground'>Integration settings page coming soon...</p>
    </div>
  )
}
