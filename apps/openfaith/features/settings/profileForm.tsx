'use client'

import { sendEmailChangeVerificationE } from '@openfaith/auth/authClientE'
import { useOrgId } from '@openfaith/openfaith/data/users/useOrgId'
import { CurrentUserWrapper } from '@openfaith/openfaith/data/users/userData.app'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { EdgeDirectionSchema, nullOp } from '@openfaith/shared'
import {
  ArrowRightIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardForm,
  CardHeader,
  CardTitle,
  toast,
  useAppForm,
  useStableMemo,
  VerifyEmailOtpDialog,
  type VerifyEmailOtpDialogRef,
} from '@openfaith/ui'
import { useZero } from '@openfaith/zero'
import type { UserClientShape } from '@openfaith/zero/clientShapes'
import { revalidateLogic } from '@tanstack/react-form'
import { Array, Effect, Equivalence, Match, Option, pipe, Schema } from 'effect'
import { type FC, useMemo, useRef } from 'react'

class ProfileUpdateError extends Schema.TaggedError<ProfileUpdateError>()('ProfileUpdateError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

const ProfileSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => 'Please enter a valid email address',
    }),
  ),
  name: Schema.String.pipe(
    Schema.minLength(1, {
      message: () => 'Name is required',
    }),
  ),
  personId: Schema.Union(Schema.String, Schema.Null),
})

type ProfileFormProps =
  | {
      _tag: 'standalone'
    }
  | {
      _tag: 'embedded'
      onSuccess?: () => void
    }

type InnerProfileFormProps = ProfileFormProps & {
  user: UserClientShape
}

const ProfileForm: FC<InnerProfileFormProps> = (props) => {
  const { user } = props
  const userId = useUserId()
  const orgId = useOrgId()
  const z = useZero()
  const verifyEmailOtpDialogRef = useRef<VerifyEmailOtpDialogRef>(null)

  const currentPersonEdgeOpt = useMemo(
    () =>
      pipe(
        user.sourceEdges,
        Array.appendAll(user.targetEdges),
        Array.findFirst(
          // We need to deal with this hardcoding down the road. It needs to be generated.
          (edge) => edge.relationshipType === 'user-is-person' && edge.orgId === orgId,
        ),
      ),
    [user, orgId],
  )

  const currentPersonId = useStableMemo(
    () =>
      pipe(
        currentPersonEdgeOpt,
        Option.match({
          onNone: nullOp,
          onSome: (edge) => {
            if (edge.sourceEntityId === userId) {
              return edge.targetEntityId
            }
            if (edge.targetEntityId === userId) {
              return edge.sourceEntityId
            }
            return null
          },
        }),
      ),
    [currentPersonEdgeOpt, userId],
    Equivalence.tuple(
      Option.getEquivalence(
        Equivalence.struct({
          sourceEntityId: Equivalence.string,
          targetEntityId: Equivalence.string,
        }),
      ),
      Equivalence.string,
    ),
  )

  const form = useAppForm({
    defaultValues: {
      email: user.email,
      name: user.name,
      personId: currentPersonId,
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: Schema.standardSchemaV1(ProfileSchema),
      onSubmitAsync: async ({ value }) => {
        return await Effect.gen(function* () {
          const emailChanged = value.email !== user.email

          yield* Effect.tryPromise({
            catch: (cause) =>
              new ProfileUpdateError({
                cause,
                message: 'Failed to update profile',
              }),
            try: () =>
              z.mutateBatch(async (tx) => {
                await tx.users.update({
                  id: userId,
                  name: value.name,
                })

                // Handle person edge changes
                if (currentPersonId !== value.personId) {
                  if (currentPersonEdgeOpt._tag === 'Some') {
                    const edge = currentPersonEdgeOpt.value
                    await tx.edges.delete({
                      orgId: edge.orgId,
                      relationshipType: edge.relationshipType,
                      sourceEntityId: edge.sourceEntityId,
                      targetEntityId: edge.targetEntityId,
                    })
                  }

                  if (value.personId) {
                    const direction = Schema.decodeUnknownSync(EdgeDirectionSchema)({
                      idA: userId,
                      idB: value.personId,
                    })

                    await tx.edges.insert({
                      _tag: 'edge',
                      createdAt: Date.now(),
                      metadata: {
                        linkedAt: new Date().toISOString(),
                      },
                      orgId,
                      // We need to deal with this hardcoding down the road. It needs to be generated.
                      relationshipType: 'user-is-person',
                      sourceEntityId: direction.source,
                      sourceEntityTypeTag: direction.source.startsWith('user') ? 'user' : 'person',
                      targetEntityId: direction.target,
                      targetEntityTypeTag: direction.target.startsWith('user') ? 'user' : 'person',
                    })
                  }
                }
              }),
          })

          // If email changed, verify it before saving
          if (emailChanged) {
            // Send OTP for email change (don't map error, let it propagate)
            yield* sendEmailChangeVerificationE({
              newEmail: value.email,
            })

            // Open dialog and wait for verification
            if (!verifyEmailOtpDialogRef.current) {
              return yield* Effect.fail(
                new ProfileUpdateError({
                  message: 'Verification dialog not available',
                }),
              )
            }

            // This will wait for the user to verify or cancel (don't map error)
            yield* verifyEmailOtpDialogRef.current.open(value.email)

            // If we get here, verification succeeded - dialog has the OTP
            // Note: The actual email update happens on the server side when verifying the OTP
            // The verifyEmailOtpDialog internally calls the verify endpoint which updates the email
            // We don't need to manually update the email in the database here
          }

          yield* pipe(
            Match.type<typeof props>(),
            Match.tag('embedded', (p) => Effect.sync(() => p.onSuccess?.())),
            Match.orElse(() => Effect.succeed(null)),
          )(props)

          yield* Effect.sync(() => toast.success('Profile updated successfully!'))
        }).pipe(
          Effect.catchTags({
            EmailChangeError: (error) =>
              Effect.gen(function* () {
                yield* Effect.logError('Failed to send email change OTP', { error })
                return {
                  fields: {
                    email: 'Failed to send verification code. Please try again.',
                  },
                }
              }),
            OtpVerificationCancelledError: (error) =>
              Effect.gen(function* () {
                yield* Effect.logError('Email verification cancelled', { error })
                return {
                  fields: {
                    email:
                      'Email verification was cancelled. Please verify your email to update it.',
                  },
                }
              }),
            ProfileUpdateError: (error) =>
              Effect.gen(function* () {
                yield* Effect.logError('Profile update failed', { error })

                // If email verification failed, show specific error on email field
                if (error.message.includes('email') || error.message.includes('verification')) {
                  return {
                    fields: {
                      email: error.message,
                    },
                  }
                }

                return {
                  fields: {},
                  form: error.message || 'Failed to update profile. Please try again.',
                }
              }),
          }),
          Effect.catchAllDefect((defect) =>
            Effect.gen(function* () {
              yield* Effect.logError('Unexpected error in profile update', { defect })
              return {
                fields: {},
                form: 'An unexpected error occurred. Please try again.',
              }
            }),
          ),
          Effect.ensureErrorType<never>(),
          Effect.runPromise,
        )
      },
    },
  })

  const formContent = (
    <>
      <form.AppField
        children={(field) => (
          <field.InputField
            autoCapitalize='words'
            autoComplete='name'
            label='Name'
            placeholder='John Doe'
            required
          />
        )}
        name='name'
      />

      <form.AppField
        children={(field) => (
          <field.InputField
            autoCapitalize='none'
            autoComplete='email'
            label='Email'
            placeholder='john@example.com'
            required
            type='email'
          />
        )}
        name='email'
      />

      <form.AppField
        children={(field) => (
          <field.SelectSchemaField
            label='Link to Person Profile'
            placeholder='Select a person profile to link'
            schemaName='person'
          />
        )}
        name='personId'
      />
    </>
  )

  const submitButton = (
    <form.Subscribe
      selector={(state) => ({
        isDirty: state.isDirty,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ isDirty, isSubmitting }) => (
        <Button
          className={pipe(
            Match.type<typeof props>(),
            Match.tag('standalone', () => 'mr-auto'),
            Match.tag('embedded', () => 'ml-auto'),
            Match.exhaustive,
          )(props)}
          disabled={!isDirty}
          loading={isSubmitting}
          type='submit'
        >
          Update Profile
          <ArrowRightIcon />
        </Button>
      )}
    </form.Subscribe>
  )

  return (
    <>
      {pipe(
        Match.type<typeof props>(),
        Match.tag('standalone', () => (
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and profile connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CardForm Actions={submitButton} form={form} Primary={formContent} />
            </CardContent>
          </Card>
        )),
        Match.tag('embedded', () => (
          <CardForm Actions={submitButton} form={form} Primary={formContent} />
        )),
        Match.exhaustive,
      )(props)}

      <VerifyEmailOtpDialog
        autoSubmit
        description='Enter the verification code sent to your new email address'
        ref={verifyEmailOtpDialogRef}
        submitLabel='Verify Email'
        title='Verify Your Email'
      />
    </>
  )
}

const WrappedProfileForm: FC<ProfileFormProps> = (props) => {
  return <CurrentUserWrapper>{(user) => <ProfileForm {...props} user={user} />}</CurrentUserWrapper>
}

export { WrappedProfileForm as ProfileForm }
