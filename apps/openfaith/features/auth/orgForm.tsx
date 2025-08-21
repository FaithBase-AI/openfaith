'use client'

import { createOrganizationE, updateOrganizationE } from '@openfaith/auth/authClientE'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { createOrgIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { useChangeOrg } from '@openfaith/openfaith/shared/auth/useChangeOrg'
import { ArrowRightIcon, Button, QuickActionForm, useAppForm } from '@openfaith/ui'
import type { OrgClientShape } from '@openfaith/zero'
import { revalidateLogic } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { Effect, Match, Option, pipe, Schema, String } from 'effect'
import { useAtom } from 'jotai'
import type { FC } from 'react'

const OrgSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(3),
    Schema.annotations({
      message: () => 'Name must have a length of at least 3',
    }),
  ),
  slug: Schema.String.pipe(
    Schema.minLength(3),
    Schema.annotations({
      message: () => 'Slug must have a length of at least 3',
    }),
  ),
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
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: Schema.standardSchemaV1(OrgSchema),
      onSubmitAsync: async ({ value }) =>
        await Effect.gen(function* () {
          yield* pipe(
            Match.type<typeof props>(),
            Match.tag('create', () =>
              Effect.gen(function* () {
                const result = yield* createOrganizationE({
                  name: pipe(value.name, String.trim),
                  slug: pipe(value.slug, String.trim),
                  userId,
                })

                yield* changeOrg({ orgId: result.id })

                setTimeout(() => {
                  router.navigate({ replace: true, to: '/dashboard' })
                }, 0)
              }),
            ),
            Match.tag('onboarding', ({ redirect = '/dashboard' }) =>
              Effect.gen(function* () {
                const trimmedName = pipe(value.name, String.trim)
                const trimmedSlug = pipe(value.slug, String.trim)

                const result = yield* createOrganizationE({
                  name: trimmedName,
                  slug: trimmedSlug,
                  userId,
                })

                yield* changeOrg({ orgId: result.id })

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
                  router.navigate({ replace: true, to: finalRedirect })
                }, 0)
              }),
            ),
            Match.tag('edit', (x) =>
              Effect.gen(function* () {
                yield* updateOrganizationE({
                  data: {
                    name: pipe(value.name, String.trim),
                    slug: pipe(value.slug, String.trim),
                  },
                  organizationId: x.org.id,
                })
              }),
            ),
            Match.exhaustive,
          )(props)

          setCreateOrgIsOpen(false)
          return
        }).pipe(
          Effect.catchTags({
            OrganizationCreateError: (error) =>
              Effect.gen(function* () {
                yield* Effect.logError('Failed to create organization', { error })
                return {
                  fields: {},
                  form: error.message || 'Failed to create organization',
                }
              }),
            OrganizationUpdateError: (error) =>
              Effect.gen(function* () {
                yield* Effect.logError('Failed to update organization', { error })
                return {
                  fields: {},
                  form: error.message || 'Failed to update organization',
                }
              }),
          }),
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* Effect.logError('Organization operation failed', { error })
              return {
                fields: {},
                form: 'Something went wrong',
              }
            }),
          ),
          Effect.runPromise,
        ),
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
