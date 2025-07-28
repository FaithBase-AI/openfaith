import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dev/logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-1 flex-col p-6'>
      <div className='mb-6'>
        <h1 className='mb-2 font-bold text-2xl'>Logs</h1>
        <p className='text-muted-foreground'>View and analyze application logs and events.</p>
      </div>

      <div className='space-y-6'>
        <div className='rounded-lg border'>
          <div className='p-6'>
            <h2 className='mb-4 font-semibold text-lg'>Application Logs</h2>
            <p className='text-muted-foreground'>
              Real-time application logs and error tracking coming soon...
            </p>
          </div>
        </div>

        <div className='rounded-lg border'>
          <div className='p-6'>
            <h2 className='mb-4 font-semibold text-lg'>System Events</h2>
            <p className='text-muted-foreground'>System events and audit logs coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
