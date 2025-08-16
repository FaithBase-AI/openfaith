'use client'

import { createOrganization, signInWithEmailOtp } from '@openfaith/auth/authClientE'
import { useChangeOrg } from '@openfaith/openfaith/shared/auth/useChangeOrg'
import { ArrowRightIcon, Button, QuickActionForm, useAppForm, usePasteDetect } from '@openfaith/ui'
import { useStore } from '@tanstack/react-store'
import { Effect, Option, pipe, Schema, String } from 'effect'

// Local error for invalid authentication response
class InvalidAuthResponseError extends Schema.TaggedError<InvalidAuthResponseError>()(
  'InvalidAuthResponseError',
  {
    message: Schema.String,
  },
) {}

import { REGEXP_ONLY_DIGITS } from 'input-otp'
import type { FC } from 'react'
import { useEffect } from 'react'

const OTPSchema = Schema.Struct({
  otp: Schema.String.pipe(Schema.minLength(6)),
})

type OnboardingOTPFormProps = {
  email: string
  orgName: string
  orgSlug: string
  onSuccess: (orgId: string) => void
}

export const OnboardingOTPForm: FC<OnboardingOTPFormProps> = (props) => {
  const { email, orgName, orgSlug, onSuccess } = props
  const { pastedContent, resetPasteContent } = usePasteDetect()

  const { changeOrg } = useChangeOrg()

  const otpForm = useAppForm({
    defaultValues: {
      otp: '',
    },
    validators: {
      onChange: Schema.standardSchemaV1(OTPSchema),
      onSubmitAsync: async ({ value }) => {
        // Form library requires async, but we use Effect internally
        return await pipe(
          Effect.gen(function* () {
            const result = yield* signInWithEmailOtp({
              email,
              otp: value.otp,
            })

            const userId = yield* pipe(
              result.data?.user?.id,
              Option.fromNullable,
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new InvalidAuthResponseError({ message: 'Invalid authentication response' }),
                  ),
                onSome: (id) => Effect.succeed(id),
              }),
            )

            const newOrg = yield* createOrganization({
              name: pipe(orgName, String.trim),
              slug: pipe(orgSlug, String.trim),
              userId,
            })

            console.log(result, newOrg)

            if (newOrg.data) {
              yield* changeOrg({ orgId: newOrg.data.id })
              yield* Effect.sync(() => onSuccess(newOrg.data.id))
            }

            return undefined
          }),
          Effect.catchTags({
            AuthError: (error) =>
              Effect.succeed({
                fields: {
                  otp: error.message,
                },
              }),
            EmailOtpError: (error) =>
              Effect.succeed({
                fields: {
                  otp: error.message,
                },
              }),
            InvalidAuthResponseError: (error) =>
              Effect.succeed({
                fields: {
                  otp: error.message,
                },
              }),
            OrganizationCreateError: (error) =>
              Effect.succeed({
                fields: {
                  otp: error.message,
                },
              }),
          }),
          Effect.catchAll(() =>
            Effect.succeed({
              fields: {
                otp: 'Verification failed. Please try again.',
              },
            }),
          ),
          Effect.runPromise,
        )
      },
    },
  })

  const otpValue = useStore(otpForm.store, (state) => state.values.otp)

  useEffect(() => {
    if (otpValue.length === 6 && otpValue.match(REGEXP_ONLY_DIGITS)) {
      otpForm.handleSubmit()
    }
  }, [otpValue, otpForm])

  useEffect(() => {
    if (typeof pastedContent === 'string') {
      const trimmedContent = pipe(pastedContent, String.trim)
      if (trimmedContent.match(REGEXP_ONLY_DIGITS) !== null) {
        otpForm.reset()
        otpForm.setFieldValue('otp', trimmedContent)
      }
    }
    resetPasteContent()
  }, [pastedContent, resetPasteContent, otpForm])

  return (
    <QuickActionForm
      Actions={
        <otpForm.Subscribe selector={(x) => x.isSubmitting}>
          {(x) => (
            <Button className='ml-auto' loading={x} type='submit'>
              Verify
              <ArrowRightIcon />
            </Button>
          )}
        </otpForm.Subscribe>
      }
      form={otpForm}
      Primary={
        <otpForm.AppField
          children={(field) => <field.OTPField autoFocus label='Verification Code' required />}
          name='otp'
        />
      }
    />
  )
}
