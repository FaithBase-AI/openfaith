import { ProfileForm } from '@openfaith/openfaith/features/settings/profileForm'
import { ScrollArea } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ScrollArea viewportClassName='px-6 pb-6'>
      <ProfileForm display='card' />
    </ScrollArea>
  )
}
