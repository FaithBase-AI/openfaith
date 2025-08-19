import { adminClient, emailOTPClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), adminClient(), organizationClient()],
})

export type Session = typeof authClient.$Infer.Session
export type ActiveOrg = typeof authClient.$Infer.ActiveOrganization
export type SlimOrg = typeof authClient.$Infer.Organization
