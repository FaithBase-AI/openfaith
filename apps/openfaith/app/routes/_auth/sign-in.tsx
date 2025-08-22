import SignIn from '@openfaith/openfaith/features/auth/signIn'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Schema } from 'effect'

const SignInSearch = Schema.Struct({
  redirect: Schema.String.pipe(Schema.optional),
})

export const Route = createFileRoute('/_auth/sign-in')({
  beforeLoad: (ctx) => {
    if (ctx.context.session.data) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: RouteComponent,
  validateSearch: Schema.decodeUnknownSync(SignInSearch),
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return <SignIn redirect={redirect} />
}
