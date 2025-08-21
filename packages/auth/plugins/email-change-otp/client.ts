import type { emailChangeOTP } from '@openfaith/auth/plugins/email-change-otp'
import type { BetterAuthClientPlugin } from 'better-auth/client'

export const emailChangeOTPClient = () => {
  return {
    $InferServerPlugin: {} as ReturnType<typeof emailChangeOTP>,
    id: 'email-change-otp',
  } satisfies BetterAuthClientPlugin
}
