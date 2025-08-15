import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-1 flex-col p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold'>Profile Settings</h1>
        <p className='text-muted-foreground'>Manage your personal profile and preferences</p>
      </div>
      {/* Profile settings content will go here */}
    </div>
  )
}
