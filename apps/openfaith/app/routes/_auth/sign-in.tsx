import SignIn from '@openfaith/openfaith/features/auth/signIn'
import { createFileRoute } from '@tanstack/react-router'
import { Schema } from 'effect'

const SignInSearch = Schema.Struct({
  redirect: Schema.String.pipe(Schema.optional),
})

export const Route = createFileRoute('/_auth/sign-in')({
  component: RouteComponent,
  validateSearch: Schema.decodeUnknownSync(SignInSearch),
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return <SignIn redirect={redirect} />
}
