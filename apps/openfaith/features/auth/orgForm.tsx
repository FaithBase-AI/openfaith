'use client'

import { authClient } from '@openfaith/auth/authClient'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { QuickActionForm } from '@openfaith/openfaith/features/quickActions/quickActionsComponents'
import { createOrgIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { useChangeOrg } from '@openfaith/openfaith/shared/auth/useChangeOrg'
import { asyncNoOp } from '@openfaith/shared'
import { ArrowRightIcon, Button, useAppForm } from '@openfaith/ui'
import type { OrgClientShape } from '@openfaith/zero'
import { useRouter } from '@tanstack/react-router'
import { Match, Option, pipe, Schema, String } from 'effect'
import { useAtom } from 'jotai'
import type { FC } from 'react'

const OrgSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(3)),
  slug: Schema.String.pipe(Schema.minLength(3)),
})

type OrgFromProps =
  | {
      _tag: 'create'
    }
  | {
      _tag: 'onboarding'
      redirect?: string
    }
  | {
      _tag: 'edit'
      org: OrgClientShape
    }

export const OrgForm: FC<OrgFromProps> = (props) => {
  const [, setCreateOrgIsOpen] = useAtom(createOrgIsOpenAtom)

  const router = useRouter()

  const { changeOrg } = useChangeOrg()

  const userId = useUserId()

  const form = useAppForm({
    defaultValues: pipe(
      Match.type<typeof props>(),
      Match.tag('edit', (x) => ({
        name: x.org.name,
        slug: x.org.slug,
      })),
      Match.orElse(() => ({
        name: '',
        slug: '',
      })),
    )(props),
    validators: {
      onChange: Schema.standardSchemaV1(OrgSchema),
    },
    onSubmit: async ({ value }) => {
      await pipe(
        Match.type<typeof props>(),
        Match.tag('create', async () => {
          const { data } = await authClient.organization.create({
            name: pipe(value.name, String.trim),
            slug: pipe(value.slug, String.trim),
            userId,
          })

          await pipe(
            data,
            Option.fromNullable,
            Option.match({
              onNone: asyncNoOp,
              onSome: async (x) => changeOrg({ orgId: x.id }),
            }),
          )

          setTimeout(() => {
            router.history.push('/dashboard')
          }, 0)
        }),
        Match.tag('onboarding', async ({ redirect = '/dashboard' }) => {
          const { data } = await authClient.organization.create({
            name: pipe(value.name, String.trim),
            slug: pipe(value.slug, String.trim),
            userId: userId,
          })

          await pipe(
            data,
            Option.fromNullable,
            Option.match({
              onNone: asyncNoOp,
              onSome: async (x) => changeOrg({ orgId: x.id }),
            }),
          )

          setTimeout(() => {
            router.history.push(redirect)
          }, 0)
        }),
        Match.tag('edit', async (x) => {
          await authClient.organization.update({
            organizationId: x.org.id,
            data: {
              name: pipe(value.name, String.trim),
              slug: pipe(value.slug, String.trim),
            },
          })
        }),
        Match.exhaustive,
      )(props)

      setCreateOrgIsOpen(false)
    },
  })

  return (
    <QuickActionForm
      form={form}
      Primary={
        <>
          <form.AppField
            name='name'
            children={(field) => (
              <field.InputField
                autoCapitalize='none'
                placeholder='My Org'
                autoComplete='name'
                required
                label='Name'
              />
            )}
          />

          <form.AppField
            name='slug'
            children={(field) => (
              <field.SlugInputField
                autoCapitalize='none'
                placeholder='my-org'
                autoComplete='slug'
                required
                label='Slug'
              />
            )}
          />
        </>
      }
      Actions={
        <form.Subscribe selector={(x) => x.isSubmitting}>
          {(x) => (
            <Button
              type='submit'
              className={pipe(
                Match.type<typeof props>(),
                Match.tag('create', () => 'ml-auto'),
                Match.tag('onboarding', () => 'mr-auto'),
                Match.tag('edit', () => 'mr-auto'),
                Match.exhaustive,
              )(props)}
              loading={x}
            >
              {pipe(
                Match.type<typeof props>(),
                Match.tag('create', () => 'Continue'),
                Match.tag('onboarding', () => 'Continue'),
                Match.tag('edit', () => 'Update'),
                Match.exhaustive,
              )(props)}

              <ArrowRightIcon />
            </Button>
          )}
        </form.Subscribe>
      }
    />
  )
}
