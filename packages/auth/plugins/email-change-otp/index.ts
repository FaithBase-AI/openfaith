import { emailRegex } from '@openfaith/shared'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint, sessionMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import { generateRandomString } from 'better-auth/crypto'
import * as z from 'zod/v4'

export interface EmailChangeOTPOptions {
  /**
   * Function to send email change verification OTP
   */
  sendEmailChangeOTP: (
    data: {
      email: string
      newEmail: string
      otp: string
      userName?: string
    },
    request?: Request,
  ) => Promise<void> | void
  /**
   * Length of the OTP
   *
   * @default 6
   */
  otpLength?: number
  /**
   * Expiry time of the OTP in seconds
   *
   * @default 300 (5 minutes)
   */
  expiresIn?: number
  /**
   * Custom function to generate otp
   */
  generateOTP?: (
    data: {
      email: string
      newEmail: string
    },
    request?: Request,
  ) => string
  /**
   * Allowed attempts for the OTP code
   * @default 3
   */
  allowedAttempts?: number
}

export const emailChangeOTP = (options: EmailChangeOTPOptions) => {
  const opts = {
    expiresIn: 5 * 60,
    generateOTP: () => generateRandomString(options.otpLength ?? 6, '0-9'),
    ...options,
  } satisfies EmailChangeOTPOptions

  const ERROR_CODES = {
    INVALID_EMAIL: 'Invalid email',
    INVALID_OTP: 'Invalid OTP',
    NO_PENDING_REQUEST: 'No pending email change request',
    OTP_EXPIRED: 'OTP expired',
    SAME_EMAIL: 'New email cannot be the same as current email',
    TOO_MANY_ATTEMPTS: 'Too many attempts',
  } as const

  function splitAtLastColon(str: string): [string, string] {
    const lastColonIndex = str.lastIndexOf(':')
    if (lastColonIndex === -1) {
      return [str, '0']
    }
    return [str.substring(0, lastColonIndex), str.substring(lastColonIndex + 1)]
  }

  const endpoints = {
    /**
     * ### Endpoint
     *
     * POST `/email-change-otp/send-verification`
     *
     * ### API Methods
     *
     * **server:**
     * `auth.api.sendEmailChangeVerification`
     *
     * **client:**
     * `authClient.emailChangeOtp.sendVerification`
     */
    sendEmailChangeVerification: createAuthEndpoint(
      '/email-change-otp/send-verification',
      {
        body: z.object({
          newEmail: z.string({}).meta({
            description: 'New email address to change to',
          }),
        }),
        metadata: {
          openapi: {
            description: 'Send email change verification OTP',
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      properties: {
                        message: {
                          description: 'Status message',
                          nullable: true,
                          type: 'string',
                        },
                        status: {
                          description: 'Indicates if the request was successful',
                          type: 'boolean',
                        },
                        user: {
                          $ref: '#/components/schemas/User',
                          nullable: true,
                        },
                      },
                      type: 'object',
                    },
                  },
                },
                description: 'Success',
              },
            },
          },
        },
        method: 'POST',
        use: [sessionMiddleware],
      },
      async (ctx) => {
        if (!options?.sendEmailChangeOTP) {
          ctx.context.logger.error('send email change OTP is not implemented')
          throw new APIError('BAD_REQUEST', {
            message: 'send email change OTP is not implemented',
          })
        }

        const newEmail = ctx.body.newEmail.toLowerCase()
        const session = ctx.context.session
        const currentEmail = session.user.email.toLowerCase()

        if (!emailRegex.test(newEmail)) {
          throw ctx.error('BAD_REQUEST', {
            message: ERROR_CODES.INVALID_EMAIL,
          })
        }

        // Check if new email is same as current
        if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
          throw new APIError('BAD_REQUEST', {
            message: ERROR_CODES.SAME_EMAIL,
          })
        }

        // Check if email already exists
        const existingUser = await ctx.context.internalAdapter.findUserByEmail(newEmail)
        if (existingUser) {
          ctx.context.logger.error('Email already exists')
          throw new APIError('BAD_REQUEST', {
            message: "Couldn't update your email",
          })
        }

        let otp = opts.generateOTP({ email: currentEmail, newEmail }, ctx.request)

        await ctx.context.internalAdapter
          .createVerificationValue(
            {
              expiresAt: new Date(Date.now() + opts.expiresIn * 1000),
              identifier: `email-change-${session.user.id}-${newEmail}`,
              value: `${otp}:0`,
            },
            ctx,
          )
          .catch(async () => {
            // might be duplicate key error
            await ctx.context.internalAdapter.deleteVerificationByIdentifier(
              `email-change-${session.user.id}-${newEmail}`,
            )
            //try again
            await ctx.context.internalAdapter.createVerificationValue(
              {
                expiresAt: new Date(Date.now() + opts.expiresIn * 1000),
                identifier: `email-change-${session.user.id}-${newEmail}`,
                value: `${otp}:0`,
              },
              ctx,
            )
          })

        await options.sendEmailChangeOTP(
          {
            email: currentEmail,
            newEmail,
            otp,
            userName: session.user.name,
          },
          ctx.request,
        )

        return ctx.json({
          message: 'Verification code sent',
          status: true,
        })
      },
    ),
    /**
     * ### Endpoint
     *
     * POST `/email-change-otp/verify`
     *
     * ### API Methods
     *
     * **server:**
     * `auth.api.verifyEmailChange`
     *
     * **client:**
     * `authClient.emailChangeOtp.verify`
     */
    verifyEmailChange: createAuthEndpoint(
      '/email-change-otp/verify',
      {
        body: z.object({
          newEmail: z.string({}).meta({
            description: 'New email address to change to',
          }),
          otp: z.string().meta({
            description: 'OTP to verify',
            required: true,
          }),
        }),
        metadata: {
          openapi: {
            description: 'Verify email change with OTP',
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      properties: {
                        required: ['status', 'user'],
                        status: {
                          description: 'Indicates if the verification was successful',
                          enum: [true],
                          type: 'boolean',
                        },
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                      type: 'object',
                    },
                  },
                },
                description: 'Success',
              },
            },
          },
        },
        method: 'POST',
        use: [sessionMiddleware],
      },
      async (ctx) => {
        const newEmail = ctx.body.newEmail.toLowerCase()
        const otp = ctx.body.otp
        const session = ctx.context.session

        if (!emailRegex.test(newEmail)) {
          throw new APIError('BAD_REQUEST', {
            message: ERROR_CODES.INVALID_EMAIL,
          })
        }

        const verificationValue = await ctx.context.internalAdapter.findVerificationValue(
          `email-change-${session.user.id}-${newEmail}`,
        )

        if (!verificationValue) {
          throw new APIError('BAD_REQUEST', {
            message: ERROR_CODES.NO_PENDING_REQUEST,
          })
        }

        if (verificationValue.expiresAt < new Date()) {
          await ctx.context.internalAdapter.deleteVerificationValue(verificationValue.id)
          throw new APIError('BAD_REQUEST', {
            message: ERROR_CODES.OTP_EXPIRED,
          })
        }

        const [otpValue, attempts] = splitAtLastColon(verificationValue.value)
        const allowedAttempts = options?.allowedAttempts || 3
        if (attempts && Number.parseInt(attempts, 10) >= allowedAttempts) {
          await ctx.context.internalAdapter.deleteVerificationValue(verificationValue.id)
          throw new APIError('FORBIDDEN', {
            message: ERROR_CODES.TOO_MANY_ATTEMPTS,
          })
        }

        if (otpValue !== otp) {
          await ctx.context.internalAdapter.updateVerificationValue(verificationValue.id, {
            value: `${otpValue}:${Number.parseInt(attempts || '0', 10) + 1}`,
          })
          throw new APIError('BAD_REQUEST', {
            message: ERROR_CODES.INVALID_OTP,
          })
        }

        // Delete verification
        await ctx.context.internalAdapter.deleteVerificationValue(verificationValue.id)

        // Check one more time if email is still available
        const existingUser = await ctx.context.internalAdapter.findUserByEmail(newEmail)
        if (existingUser) {
          ctx.context.logger.error('Email already exists')
          throw new APIError('BAD_REQUEST', {
            message: "Couldn't update your email",
          })
        }

        // Update user email
        const updatedUser = await ctx.context.internalAdapter.updateUser(
          session.user.id,
          {
            email: newEmail,
            emailVerified: true, // Mark as verified since they proved ownership via OTP
          },
          ctx,
        )

        // Update session cookie with new user data
        await setSessionCookie(ctx, {
          session: session.session,
          user: updatedUser,
        })

        return ctx.json({
          status: true,
          user: {
            createdAt: updatedUser.createdAt,
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified,
            id: updatedUser.id,
            image: updatedUser.image,
            name: updatedUser.name,
            updatedAt: updatedUser.updatedAt,
          },
        })
      },
    ),
  }

  return {
    $ERROR_CODES: ERROR_CODES,
    endpoints: {
      ...endpoints,
    },
    id: 'email-change-otp',
    rateLimit: [
      {
        max: 3,
        pathMatcher(path) {
          return path === '/email-change-otp/send-verification'
        },
        window: 60,
      },
      {
        max: 3,
        pathMatcher(path) {
          return path === '/email-change-otp/verify'
        },
        window: 60,
      },
    ],
  } satisfies BetterAuthPlugin
}
