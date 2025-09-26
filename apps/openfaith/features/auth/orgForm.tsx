'use client'

import { createOrganizationE, updateOrganizationE } from '@openfaith/auth/authClientE'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { createOrgIsOpenAtom } from '@openfaith/openfaith/features/quickActions/quickActionsState'
import { useChangeOrg } from '@openfaith/openfaith/shared/auth/useChangeOrg'
import { env } from '@openfaith/shared'
import {
  ArrowRightIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardForm,
  CardHeader,
  CardTitle,
  QuickActionForm,
  useAppForm,
} from '@openfaith/ui'
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

interface OrgFormBaseProps {
  display: 'quickAction' | 'card'
}

interface OrgFormCreateProps extends OrgFormBaseProps {
  _tag: 'create'
}

interface OrgFormOnboardingProps extends OrgFormBaseProps {
  _tag: 'onboarding'
  redirect?: string
}

interface OrgFormEditProps extends OrgFormBaseProps {
  _tag: 'edit'
  org: OrgClientShape
}

type OrgFormProps = OrgFormCreateProps | OrgFormOnboardingProps | OrgFormEditProps

export const OrgForm: FC<OrgFormProps> = (props) => {
  const { display = 'quickAction' } = props
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
                  router.navigate({ replace: true, to: env.VITE_APP_REDIRECT_URL })
                }, 0)
              }),
            ),
            Match.tag('onboarding', ({ redirect = env.VITE_APP_REDIRECT_URL }) =>
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
              updateOrganizationE({
                data: {
                  name: pipe(value.name, String.trim),
                  slug: pipe(value.slug, String.trim),
                },
                organizationId: x.org.id,
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

  const formContent = (
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
  )

  const submitButton = (
    <form.Subscribe
      selector={(state) => ({
        isDefaultValue: state.isDefaultValue,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ isSubmitting, isDefaultValue }) => (
        <Button
          className={pipe(
            Match.type<typeof props>(),
            Match.tag('create', () => (display === 'card' ? 'mr-auto' : 'ml-auto')),
            Match.tag('onboarding', () => 'mr-auto'),
            Match.tag('edit', () => 'mr-auto'),
            Match.exhaustive,
          )(props)}
          disabled={isDefaultValue}
          loading={isSubmitting}
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
  )

  return pipe(
    display,
    Match.value,
    Match.when('quickAction', () => (
      <QuickActionForm Actions={submitButton} form={form} Primary={formContent} />
    )),
    Match.when('card', () => (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your organization's basic information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardForm Actions={submitButton} form={form} Primary={formContent} />
        </CardContent>
      </Card>
    )),
    Match.exhaustive,
  )
}
