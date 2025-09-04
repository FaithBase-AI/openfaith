import { emailChangeOTPClient } from '@openfaith/auth/plugins'
import { adminClient, emailOTPClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_ZERO_SERVER,
  plugins: [emailOTPClient(), adminClient(), organizationClient(), emailChangeOTPClient()],
})

export type Session = typeof authClient.$Infer.Session
export type ActiveOrg = typeof authClient.$Infer.ActiveOrganization
export type SlimOrg = typeof authClient.$Infer.Organization
