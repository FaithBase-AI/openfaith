'use client'

import { inviteMemberE } from '@openfaith/auth/authClient'
import { QuickActionForm } from '@openfaith/openfaith/features/quickActions/quickActionsComponents'
import { inviteMemberIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { Button, useAppForm } from '@openfaith/ui'
import { Effect, pipe, Schema } from 'effect'
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
    onSubmit: async ({ value }) => {
      const program = pipe(
        inviteMemberE({
          email: value.email,
          role: value.role as 'member' | 'admin',
        }),
        Effect.tap(() => Effect.sync(() => setInviteMemberIsOpen(false))),
        Effect.catchAll(() =>
          Effect.sync(() => {
            // Handle error - could add toast notification here
            console.error('Failed to send invitation')
          }),
        ),
      )

      await Effect.runPromise(program)
    },
    validators: {
      onChange: Schema.standardSchemaV1(InviteMemberSchema),
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
                  { name: 'Member', value: 'member' },
                  { name: 'Admin', value: 'admin' },
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
