import { ProfileForm } from '@openfaith/openfaith/features/settings/profileForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-1 flex-col p-6'>
      <ProfileForm _tag='standalone' />
    </div>
  )
}
