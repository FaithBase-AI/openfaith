'use client'

import { createOrganization, updateOrganization } from '@openfaith/auth/authClientE'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { createOrgIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { useChangeOrg } from '@openfaith/openfaith/shared/auth/useChangeOrg'
import { ArrowRightIcon, Button, QuickActionForm, useAppForm } from '@openfaith/ui'
import type { OrgClientShape } from '@openfaith/zero'
import { useRouter } from '@tanstack/react-router'
import { Effect, Match, Option, pipe, Schema, String } from 'effect'
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
        slug: pipe(
          x.org.slug,
          Option.fromNullable,
          Option.getOrElse(() => ''),
        ),
      })),
      Match.orElse(() => ({
        name: '',
        slug: '',
      })),
    )(props),
    onSubmit: async ({ value }) => {
      await pipe(
        Match.type<typeof props>(),
        Match.tag('create', () =>
          Effect.gen(function* () {
            const result = yield* createOrganization({
              name: pipe(value.name, String.trim),
              slug: pipe(value.slug, String.trim),
              userId,
            })

            if (result.data) {
              yield* changeOrg({ orgId: result.data.id })
            }

            setTimeout(() => {
              router.history.push('/dashboard')
            }, 0)
          }),
        ),
        Match.tag('onboarding', ({ redirect = '/dashboard' }) =>
          Effect.gen(function* () {
            const trimmedName = pipe(value.name, String.trim)
            const trimmedSlug = pipe(value.slug, String.trim)

            const result = yield* createOrganization({
              name: trimmedName,
              slug: trimmedSlug,
              userId: userId,
            })

            if (result.data) {
              yield* changeOrg({ orgId: result.data.id })
            }

            // For onboarding, pass org data in the URL if redirecting to onboarding flow
            const finalRedirect = redirect.includes('/onboarding')
              ? `/onboarding?step=${encodeURIComponent(
                  JSON.stringify({
                    _tag: 'integrations',
                    orgName: trimmedName,
                    orgSlug: trimmedSlug,
                  }),
                )}`
              : redirect

            setTimeout(() => {
              router.history.push(finalRedirect)
            }, 0)
          }),
        ),
        Match.tag('edit', (x) =>
          updateOrganization({
            data: {
              name: pipe(value.name, String.trim),
              slug: pipe(value.slug, String.trim),
            },
            organizationId: x.org.id,
          }),
        ),
        Match.exhaustive,
      )(props).pipe(Effect.runPromise)

      setCreateOrgIsOpen(false)
    },
    validators: {
      onChange: Schema.standardSchemaV1(OrgSchema),
    },
  })

  return (
    <QuickActionForm
      Actions={
        <form.Subscribe selector={(x) => x.isSubmitting}>
          {(x) => (
            <Button
              className={pipe(
                Match.type<typeof props>(),
                Match.tag('create', () => 'ml-auto'),
                Match.tag('onboarding', () => 'mr-auto'),
                Match.tag('edit', () => 'mr-auto'),
                Match.exhaustive,
              )(props)}
              loading={x}
              type='submit'
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
      form={form}
      Primary={
        <>
          <form.AppField
            children={(field) => (
              <field.InputField
                autoCapitalize='none'
                autoComplete='name'
                label='Name'
                placeholder='My Org'
                required
              />
            )}
            name='name'
          />

          <form.AppField
            children={(field) => (
              <field.SlugInputField
                autoCapitalize='none'
                autoComplete='slug'
                label='Slug'
                placeholder='my-org'
                required
              />
            )}
            name='slug'
          />
        </>
      }
    />
  )
}
