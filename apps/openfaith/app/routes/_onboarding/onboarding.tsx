import { useAdaptersDetailsCollection } from '@openfaith/openfaith/data/adapterDetails/adapterDetailsData.app'
import { OrgForm } from '@openfaith/openfaith/features/auth/orgForm'
import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { OnboardingProgress } from '@openfaith/openfaith/features/onboarding/onboardingProgress'
import {
  ActionRow,
  ArrowRightIcon,
  Button,
  GroupIcon,
  ScrollArea,
  Separator,
  ShareNodesIcon,
} from '@openfaith/ui'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Array, Data, Match, pipe, Schema } from 'effect'
import type { FC } from 'react'

type OnboardingStep = Data.TaggedEnum<{
  organization: {}
  integrations: {
    readonly orgName: string
    readonly orgSlug: string
  }
}>

const OnboardingStep = Data.taggedEnum<OnboardingStep>()

const OnboardingStepSchema = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal('organization'),
  }),
  Schema.Struct({
    _tag: Schema.Literal('integrations'),
    orgName: Schema.String,
    orgSlug: Schema.String,
  }),
)

const OnboardingSearch = Schema.Struct({
  redirect: Schema.String.pipe(Schema.optional),
  step: Schema.optional(OnboardingStepSchema),
})

const stepLookup = {
  integrations: 2,
  organization: 1,
} as const

const stepIconLookup = {
  integrations: <ShareNodesIcon className='mr-2 size-4' />,
  organization: <GroupIcon className='mr-2 size-4' />,
} as const

const stepTitleLookup = {
  integrations: 'Sync with your ChMS',
  organization: 'Create Organization',
} as const

export const Route = createFileRoute('/_onboarding/onboarding')({
  component: OnboardingPage,
  validateSearch: Schema.standardSchemaV1(OnboardingSearch),
})

function OnboardingPage() {
  const { step = OnboardingStep.organization() } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <div className='m-auto flex w-full max-w-2xl flex-col items-start gap-4'>
      <OnboardingProgress
        currentStep={stepLookup[step._tag as keyof typeof stepLookup]}
        totalSteps={2}
      />

      <div className='m-auto w-full gap-0 overflow-hidden rounded-2xl border border-neutral-200 p-0 shadow-2xl'>
        <div className='flex flex-col space-y-1.5 p-4 text-center sm:text-left'>
          <span className='font-semibold text-lg leading-none tracking-tight'>
            <span className='inline-flex flex-row items-center'>
              {stepIconLookup[step._tag as keyof typeof stepIconLookup]}
              {stepTitleLookup[step._tag as keyof typeof stepTitleLookup]}
            </span>
          </span>
        </div>

        <Separator />

        {pipe(
          Match.type<OnboardingStep>(),
          Match.tag('organization', () => (
            <OrgForm _tag='onboarding' redirect='/onboarding?step=integrations' />
          )),
          Match.tag('integrations', () => (
            <>
              <ScrollArea className='flex max-h-[50vh] flex-col'>
                <IntegrationsComponent />
              </ScrollArea>
              <IntegrationsButtons
                onContinue={() => navigate({ to: '/dashboard' })}
                onSkip={() => navigate({ to: '/dashboard' })}
              />
            </>
          )),
          Match.exhaustive,
        )(step)}
      </div>
    </div>
  )
}
interface IntegrationsButtonsProps {
  onSkip: () => void
  onContinue: () => void
}

const IntegrationsButtons: FC<IntegrationsButtonsProps> = (props) => {
  const { onSkip, onContinue } = props

  const { adapterDetailsCollection, loading } = useAdaptersDetailsCollection()

  const hasAdapter =
    !loading &&
    pipe(
      adapterDetailsCollection,
      Array.filter((x) => x.enabled),
      Array.isNonEmptyArray,
    )

  return (
    <ActionRow>
      {hasAdapter ? (
        <Button onClick={onContinue}>
          Continue
          <ArrowRightIcon />
        </Button>
      ) : (
        <Button onClick={onSkip} variant='ghost'>
          Skip
        </Button>
      )}
    </ActionRow>
  )
}
