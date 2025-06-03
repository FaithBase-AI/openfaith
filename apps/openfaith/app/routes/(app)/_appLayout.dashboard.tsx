import { useSignOut } from '@openfaith/openfaith/shared/auth/useSignOut'
import { Button } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/_appLayout/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const signOut = useSignOut()

  return (
    <div>
      Hello "/(app)/dashboard"!
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  )
}
