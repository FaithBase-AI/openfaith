'use client'

import { signInWithEmailOtpE, verifyEmailChangeE, verifyEmailE } from '@openfaith/auth/authClientE'
import { nullOp } from '@openfaith/shared'
import { ArrowRightIcon, Button, Form, useAppForm, usePasteDetect } from '@openfaith/ui'
import { revalidateLogic } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { Effect, pipe, Schema, String } from 'effect'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { type FC, useEffect } from 'react'

const OTPSchema = Schema.Struct({
  otp: Schema.String.pipe(Schema.minLength(6)),
})

interface OtpFormBaseProps {
  email: string
  submitLabel?: string
  autoSubmit?: boolean
  onSuccess?: () => void
}

interface SignInOtpFormProps extends OtpFormBaseProps {
  _tag: 'sign-in'
}

interface VerifyEmailOtpFormProps extends OtpFormBaseProps {
  _tag: 'verify-email'
}

interface EmailChangeOtpFormProps extends OtpFormBaseProps {
  _tag: 'email-change'
}

export type OtpFormProps = SignInOtpFormProps | VerifyEmailOtpFormProps | EmailChangeOtpFormProps

export const OtpForm: FC<OtpFormProps> = (props) => {
  const { email, submitLabel = 'Verify', autoSubmit = true, onSuccess = nullOp } = props

  const { pastedContent, resetPasteContent } = usePasteDetect()

  const form = useAppForm({
    defaultValues: {
      otp: '',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: Schema.standardSchemaV1(OTPSchema),
      onSubmitAsync: async ({ value }) => {
        return await Effect.gen(function* () {
          if (props._tag === 'sign-in') {
            yield* signInWithEmailOtpE({
              email,
              otp: value.otp,
            })
          }

          if (props._tag === 'verify-email') {
            yield* verifyEmailE({
              email,
              otp: value.otp,
            })
          }

          if (props._tag === 'email-change') {
            yield* verifyEmailChangeE({
              newEmail: email,
              otp: value.otp,
            })
          }

          // yield* Match.type<typeof props>().pipe(
          //   Match.tag('sign-in', () =>
          //     signInWithEmailOtpE({
          //       email,
          //       otp: value.otp,
          //     }),
          //   ),
          //   Match.tag('verify-email', () =>
          //     verifyEmailE({
          //       email,
          //       otp: value.otp,
          //     }),
          //   ),
          //   Match.tag('email-change', () =>
          //     verifyEmailChangeOtpE({
          //       newEmail: email,
          //       otp: value.otp,
          //     }),
          //   ),
          //   Match.exhaustive,
          // )(props)

          yield* Effect.sync(() => onSuccess())

          return undefined
        }).pipe(
          Effect.catchTags({
            EmailChangeError: (error) => {
              console.log('EmailChangeError', error)

              return Effect.succeed({
                fields: {
                  otp: error.message,
                },
              })
            },
            OTPVerificationError: (error) => {
              console.log('OTPVerificationError', error)

              return Effect.succeed({
                fields: {
                  otp: error.message,
                },
              })
            },
          }),
          Effect.catchAllDefect(() =>
            Effect.succeed({
              fields: {
                otp: 'Something went wrong',
              },
            }),
          ),
          Effect.ensureErrorType<never>(),
          Effect.runPromise,
        )
      },
    },
  })

  const otpValue = useStore(form.store, (state) => state.values.otp)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (autoSubmit && otpValue.length === 6 && otpValue.match(REGEXP_ONLY_DIGITS)) {
      form.handleSubmit()
    }
  }, [otpValue, autoSubmit, form])

  // Handle pasted content
  useEffect(() => {
    if (typeof pastedContent === 'string') {
      const trimmedContent = pipe(pastedContent, String.trim)
      if (trimmedContent.match(REGEXP_ONLY_DIGITS) !== null) {
        form.reset()
        form.setFieldValue('otp', trimmedContent)
      }
    }
    resetPasteContent()
  }, [pastedContent, form, resetPasteContent])

  return (
    <Form form={form}>
      <form.AppField
        children={(field) => <field.OTPField autoFocus label='Verification Code' required />}
        name='otp'
      />

      <Button className='w-full gap-2' loading={isSubmitting} type='submit'>
        {submitLabel}
        <ArrowRightIcon />
      </Button>
    </Form>
  )
}
