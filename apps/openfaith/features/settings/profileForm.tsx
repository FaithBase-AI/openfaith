'use client'

import { sendVerificationOtpE, verifyEmailE } from '@openfaith/auth/authClientE'
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
} from '@openfaith/ui'
import { useZero } from '@openfaith/zero'
import type { UserClientShape } from '@openfaith/zero/clientShapes'
import { revalidateLogic } from '@tanstack/react-form'
import { Array, Effect, Equivalence, Match, Option, pipe, Schema } from 'effect'
import { type FC, useMemo, useState } from 'react'

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
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const currentPersonEdgeOpt = useMemo(
    () =>
      pipe(
        user.sourceEdges,
        Array.appendAll(user.targetEdges),
        Array.findFirst(
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
                  email: value.email,
                  id: userId,
                  name: value.name,
                })

                // If the form has a different personId than the initial value, do things.
                if (currentPersonId !== value.personId) {
                  // We have a previous personId, so we need to delete the edge.
                  if (currentPersonEdgeOpt._tag === 'Some') {
                    const edge = currentPersonEdgeOpt.value
                    await tx.edges.delete({
                      orgId: edge.orgId,
                      relationshipType: edge.relationshipType,
                      sourceEntityId: edge.sourceEntityId,
                      targetEntityId: edge.targetEntityId,
                    })
                  }

                  // If the form has a new personId, we need to create a new edge.
                  if (value.personId) {
                    const direction = Schema.decodeUnknownSync(EdgeDirectionSchema)({
                      idA: userId,
                      idB: value.personId,
                    })

                    // Create the edge with proper direction
                    await tx.edges.insert({
                      _tag: 'edge',
                      createdAt: Date.now(),
                      metadata: {
                        linkedAt: new Date().toISOString(),
                      },
                      orgId,
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

          // If email changed, trigger verification
          if (emailChanged) {
            // Send OTP for email verification
            yield* pipe(
              sendVerificationOtpE({
                email: value.email,
                type: 'email-verification',
              }),
              Effect.mapError(
                (cause) =>
                  new ProfileUpdateError({
                    cause,
                    message: 'Failed to send verification email',
                  }),
              ),
            )

            // Show the verification dialog
            yield* Effect.sync(() => {
              setPendingEmail(value.email)
              setShowVerificationDialog(true)
            })
          }

          yield* pipe(
            Match.type<typeof props>(),
            Match.tag('embedded', (p) => Effect.sync(() => p.onSuccess?.())),
            Match.orElse(() => Effect.succeed(null)),
          )(props)

          yield* Effect.sync(() => toast.success('Profile updated successfully!'))

          return null
        }).pipe(
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* Effect.logError('Profile update failed', { error })
              yield* Effect.sync(() => toast.error('Profile update failed'))

              // Return form-level error object for TanStack Form
              return {
                fields: {},
                form: 'Failed to update profile. Please try again.',
              }
            }),
          ),
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

  const handleEmailVerification = (otp: string) =>
    verifyEmailE({
      email: pendingEmail,
      otp,
    }).pipe(
      Effect.tap(() =>
        Effect.sync(() => {
          toast.success('Email verified successfully!')
          setShowVerificationDialog(false)
          setPendingEmail('')
        }),
      ),
      Effect.map(() => undefined),
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
        email={pendingEmail}
        onOpenChange={setShowVerificationDialog}
        onSubmit={handleEmailVerification}
        open={showVerificationDialog}
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
