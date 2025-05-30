import { adminClient, emailOTPClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { Effect } from 'effect'

export const authClient = createAuthClient({
  // fetchOptions: {
  //   auth: {
  //     type: 'Bearer',
  //     token: () => {
  //       if (typeof window !== 'undefined') {
  //         return localStorage.getItem('bearer_token') || ''
  //       }

  //       return ''
  //     }, // get the token from localStorage
  //   },
  //   onSuccess: (ctx) => {
  //     const authToken = ctx.response.headers.get('set-auth-token') // get the token from the response headers
  //     // Store the token securely (e.g., in localStorage)
  //     if (authToken && typeof window !== 'undefined') {
  //       localStorage.setItem('bearer_token', authToken)
  //     }
  //   },
  // },
  plugins: [emailOTPClient(), adminClient(), organizationClient()],
})

export type Session = typeof authClient.$Infer.Session
export type ActiveOrg = typeof authClient.$Infer.ActiveOrganization
export type SlimOrg = typeof authClient.$Infer.Organization

// export const { useAuth, refreshAuth } =
//   createBetterAuthClient({
//     fetchOptions: {
//       auth: {
//         type: 'Bearer',
//         token: () => {
//           if (typeof window !== 'undefined') {
//             return localStorage.getItem('bearer_token') || ''
//           }

//           return ''
//         }, // get the token from localStorage
//       },
//       onSuccess: (ctx) => {
//         const authToken = ctx.response.headers.get('set-auth-token') // get the token from the response headers
//         // Store the token securely (e.g., in localStorage)
//         if (authToken && typeof window !== 'undefined') {
//           localStorage.setItem('bearer_token', authToken)
//         }
//       },
//     },
//     plugins: [
//       emailOTPClient(),
//       anonymousClient(),
//       adminClient(),
//       organizationClient(),
//       stripeClient({
//         subscription: true,
//       }),
//     ],
//   })

export const inviteMemberE = (params: Parameters<typeof authClient.organization.inviteMember>[0]) =>
  Effect.tryPromise(async () => authClient.organization.inviteMember(params))
