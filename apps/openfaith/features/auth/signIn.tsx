'use client'
import { authClient } from '@openfaith/auth/authClient'
import { env, nullOp } from '@openfaith/shared'
import {
  ArrowRightIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  useAppForm,
  usePasteDetect,
} from '@openfaith/ui'
import { useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Boolean, Option, pipe, Schema, String } from 'effect'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useQueryState } from 'nuqs'
import { type FC, useEffect } from 'react'

const SignInSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.minLength(3),
    Schema.annotations({
      message: () => 'Email must have a length of at least 3',
    }),
  ),
})

const OTPSchema = Schema.Struct({
  otp: Schema.String.pipe(Schema.minLength(6)),
})

type SignInProps = {
  redirect?: string
}

const SignIn: FC<SignInProps> = (props) => {
  const { redirect = '/dashboard' } = props

  const router = useRouter()

  const [invitationId] = useQueryState('invitation-id')
  const [passedOtpEmail] = useQueryState('email')

  const { data: session } = authClient.useSession()

  // biome-ignore lint/correctness/useExhaustiveDependencies: no update
  useEffect(() => {
    pipe(
      session,
      Option.fromNullable,
      Option.match({
        onNone: nullOp,
        onSome: () => {
          setTimeout(() => {
            pipe(
              invitationId,
              Option.fromNullable,
              Option.match({
                onNone: () => {
                  router.history.push(redirect)
                },
                onSome: (x) => {
                  router.history.push(`/accept-invitation/${x}`)
                },
              }),
            )
          }, 0)
        },
      }),
    )
  }, [session])

  const emailForm = useAppForm({
    defaultValues: {
      email: passedOtpEmail || '',
    },
    onSubmit: async ({ value }) => {
      await authClient.emailOtp.sendVerificationOtp({
        email: value.email,
        type: 'sign-in',
      })
    },
    validators: {
      onChange: Schema.standardSchemaV1(SignInSchema),
    },
  })

  const { pastedContent, resetPasteContent } = usePasteDetect()

  const email = useStore(emailForm.store, (state) => state.values.email)
  const emailFormSubmitting = useStore(emailForm.store, (state) => state.isSubmitting)
  const emailFormHasSubmitted = useStore(
    emailForm.store,
    (state) => state.isSubmitted || pipe(passedOtpEmail, Option.fromNullable, Option.isSome),
  )

  const otpForm = useAppForm({
    defaultValues: {
      otp: '',
    },
    validators: {
      onChange: Schema.standardSchemaV1(OTPSchema),
      onSubmitAsync: async ({ value }) => {
        const result = await authClient.signIn.emailOtp({
          email: email,
          otp: value.otp,
        })

        if (result.error) {
          return {
            fields: {
              otp: result.error.message,
            },
          }
        }

        return
      },
    },
  })

  const otpValue = useStore(otpForm.store, (state) => state.values.otp)

  // biome-ignore lint/correctness/useExhaustiveDependencies: no update
  useEffect(() => {
    if (otpValue.length === 6 && otpValue.match(REGEXP_ONLY_DIGITS)) {
      otpForm.handleSubmit()
    }
  }, [otpValue])

  // biome-ignore lint/correctness/useExhaustiveDependencies: no update
  useEffect(() => {
    if (typeof pastedContent === 'string') {
      const trimmedContent = pipe(pastedContent, String.trim)
      if (trimmedContent.match(REGEXP_ONLY_DIGITS) !== null && emailFormHasSubmitted) {
        otpForm.reset()
        otpForm.setFieldValue('otp', trimmedContent)
      }
    }
    resetPasteContent()
  }, [pastedContent])

  return (
    <Card className='w-96 max-w-[calc(100vw-2.5rem)]'>
      <CardHeader>
        <CardTitle className='font-medium text-4xl'>
          {pipe(
            emailFormHasSubmitted,
            Boolean.match({
              onFalse: () => `Sign in to ${env.VITE_APP_NAME}`,
              onTrue: () => 'Check your email',
            }),
          )}
        </CardTitle>
        <CardDescription className='font-normal text-sm'>
          {pipe(
            emailFormHasSubmitted,
            Boolean.match({
              onFalse: () => 'Welcome back! Please sign in to continue',
              onTrue: () => 'Use the verification link sent to your email',
            }),
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pipe(
          emailFormHasSubmitted,
          Boolean.match({
            onFalse: () => (
              <Form form={emailForm}>
                <emailForm.AppField
                  children={(field) => (
                    <field.InputField
                      autoCapitalize='none'
                      autoComplete='email'
                      label='Email address'
                      placeholder='you@gmail.com'
                      required
                    />
                  )}
                  name='email'
                />

                <Button className='w-full gap-2' loading={emailFormSubmitting} type='submit'>
                  Continue
                  <ArrowRightIcon />
                </Button>
              </Form>
            ),
            onTrue: () => (
              <Form form={otpForm}>
                <otpForm.AppField
                  children={(field) => <field.OTPField autoFocus label='OTP' required />}
                  name='otp'
                />

                <otpForm.Subscribe selector={(x) => x.isSubmitting}>
                  {(x) => (
                    <Button className='w-full gap-2' loading={x} type='submit'>
                      Sign In
                      <ArrowRightIcon />
                    </Button>
                  )}
                </otpForm.Subscribe>
              </Form>
            ),
          }),
        )}
      </CardContent>
    </Card>
  )
}

export default SignIn
