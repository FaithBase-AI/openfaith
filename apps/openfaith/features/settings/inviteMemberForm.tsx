'use client'

import { inviteMemberE } from '@openfaith/auth/authClientE'
import { inviteMemberIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { Button, QuickActionForm, useAppForm } from '@openfaith/ui'
import { revalidateLogic } from '@tanstack/react-form'
import { Effect, Schema } from 'effect'
import { useSetAtom } from 'jotai'
import type { FC } from 'react'

const InviteMemberSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.minLength(1)),
  role: Schema.String,
})

export const InviteMemberForm: FC = () => {
  const setInviteMemberIsOpen = useSetAtom(inviteMemberIsOpenAtom)

  const form = useAppForm({
    defaultValues: {
      email: '',
      role: 'member',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: Schema.standardSchemaV1(InviteMemberSchema),
      onSubmitAsync: async ({ value }) =>
        await Effect.gen(function* () {
          yield* inviteMemberE({
            email: value.email,
            role: value.role as 'member' | 'admin',
          })
          yield* Effect.sync(() => setInviteMemberIsOpen(false))
          return
        }).pipe(
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* Effect.logError('Failed to send invitation', { error })
              return {
                fields: {},
                form: 'Failed to send invitation. Please try again.',
              }
            }),
          ),
          Effect.catchAllDefect(() =>
            Effect.succeed({
              fields: {},
              form: 'Something went wrong',
            }),
          ),
          Effect.ensureErrorType<never>(),
          Effect.runPromise,
        ),
    },
  })

  return (
    <QuickActionForm
      Actions={
        <>
          <Button onClick={() => setInviteMemberIsOpen(false)} type='button' variant='outline'>
            Cancel
          </Button>
          <form.Subscribe selector={(x) => x.isSubmitting}>
            {(isSubmitting) => (
              <Button loading={isSubmitting} type='submit'>
                Send Invitation
              </Button>
            )}
          </form.Subscribe>
        </>
      }
      form={form}
      Primary={
        <>
          <form.AppField
            children={(field) => (
              <field.InputField
                autoComplete='email'
                label='Email Address'
                placeholder='Enter email address'
                required
                type='email'
              />
            )}
            name='email'
          />

          <form.AppField
            children={(field) => (
              <field.SelectField
                label='Role'
                options={[
                  { label: 'Member', value: 'member' },
                  { label: 'Admin', value: 'admin' },
                ]}
                placeholder='Select a role'
                required
              />
            )}
            name='role'
          />
        </>
      }
    />
  )
}
