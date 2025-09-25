import { CurrentUserWrapper } from '@openfaith/openfaith/data/users/userData.app'
import { ProfileForm } from '@openfaith/openfaith/features/settings/profileForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyDetails,
  ScrollArea,
} from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ScrollArea viewportClassName='px-6 pb-6'>
      <div className='flex flex-col gap-4'>
        <ProfileForm display='card' />

        <Card>
          <CardHeader>
            <CardTitle>Technical</CardTitle>
            <CardDescription>
              Little details you might need when interacting with support.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex'>
            <CurrentUserWrapper>
              {(user) => <CopyDetails Label={'User Id'} value={user.id} />}
            </CurrentUserWrapper>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
