'use client'
import { authClient } from '@openfaith/auth/authClient'
import { sendVerificationOtpE } from '@openfaith/auth/authClientE'
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
  OtpForm,
  toast,
  useAppForm,
} from '@openfaith/ui'
import { revalidateLogic } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Boolean, Effect, Option, pipe, Schema } from 'effect'
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
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: Schema.standardSchemaV1(SignInSchema),
      onSubmitAsync: async ({ value }) => {
        await Effect.gen(function* () {
          yield* sendVerificationOtpE({
            email: value.email,
            type: 'sign-in',
          })

          return
        }).pipe(
          // Handle specific error types
          Effect.catchTags({
            EmailOtpError: (error) =>
              Effect.gen(function* () {
                yield* Effect.logError('Failed to send OTP', { error })
                yield* Effect.sync(() =>
                  toast.error(error.message || 'Failed to send verification code'),
                )

                return {
                  fields: {},
                  form: error.message || 'Failed to send verification code',
                }
              }),
          }),
          // Handle all remaining errors and defects
          Effect.catchAllDefect(() =>
            Effect.succeed({
              fields: {},
              form: 'Something went wrong',
            }),
          ),
          Effect.runPromise,
        )
      },
    },
  })

  const email = useStore(emailForm.store, (state) => state.values.email)
  const emailFormSubmitting = useStore(emailForm.store, (state) => state.isSubmitting)
  const emailFormHasSubmitted = useStore(
    emailForm.store,
    (state) => state.isSubmitted || pipe(passedOtpEmail, Option.fromNullable, Option.isSome),
  )

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
            onTrue: () => <OtpForm _tag='sign-in' autoSubmit email={email} submitLabel='Sign In' />,
          }),
        )}
      </CardContent>
    </Card>
  )
}

export default SignIn
