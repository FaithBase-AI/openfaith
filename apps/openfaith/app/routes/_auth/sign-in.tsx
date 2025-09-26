import SignIn from '@openfaith/openfaith/features/auth/signIn'
import { env } from '@openfaith/shared'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Schema } from 'effect'

const SignInSearch = Schema.Struct({
  'invitation-id': Schema.String.pipe(Schema.optional),
  redirect: Schema.String.pipe(Schema.optional),
})

export const Route = createFileRoute('/_auth/sign-in')({
  beforeLoad: (ctx) => {
    const { 'invitation-id': _invitationId, redirect: to = env.VITE_APP_REDIRECT_URL } = ctx.search

    if (ctx.context.session.data) {
      // if (invitationId) {
      //   throw redirect({
      //     to: `/accept-invitation/${invitationId}`,
      //   })
      // }

      if (ctx.context.session.data.activeOrganizationId) {
        throw redirect({
          to,
        })
      }
      throw redirect({
        search: {
          redirect: to,
        },
        to: '/onboarding',
      })
    }
  },
  component: RouteComponent,
  validateSearch: Schema.standardSchemaV1(SignInSearch),
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return <SignIn redirect={redirect} />
}
