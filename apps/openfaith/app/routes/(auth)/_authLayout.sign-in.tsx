import SignIn from '@openfaith/openfaith/features/auth/signIn'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_authLayout/sign-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignIn />
}
