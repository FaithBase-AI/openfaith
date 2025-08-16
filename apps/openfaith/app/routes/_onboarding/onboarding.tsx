import { authClient } from '@openfaith/auth/authClient'
import { OrgForm } from '@openfaith/openfaith/features/auth/orgForm'
import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { OnboardingOTPForm } from '@openfaith/openfaith/features/onboarding/onboardingOtpForm'
import { OnboardingProgress } from '@openfaith/openfaith/features/onboarding/onboardingProgress'
import {
  ActionRow,
  ArrowRightIcon,
  Button,
  EmailIcon,
  GroupIcon,
  ScrollArea,
  Separator,
  ShareNodesIcon,
} from '@openfaith/ui'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Data, Effect, Match, Option, pipe, Schema } from 'effect'

// Define the step types using Data.taggedEnum
type OnboardingStep = Data.TaggedEnum<{
  organization: {}
  integrations: {
    readonly orgName: string
    readonly orgSlug: string
  }
  'email-verification': {
    readonly email: string
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
  Schema.Struct({
    _tag: Schema.Literal('email-verification'),
    email: Schema.String,
    orgName: Schema.String,
    orgSlug: Schema.String,
  }),
)

const stepLookup = {
  'email-verification': 3,
  integrations: 2,
  organization: 1,
} as const

const stepIconLookup = {
  'email-verification': <EmailIcon className='mr-2 size-4' />,
  integrations: <ShareNodesIcon className='mr-2 size-4' />,
  organization: <GroupIcon className='mr-2 size-4' />,
} as const

const stepTitleLookup = {
  'email-verification': 'Verify Email',
  integrations: 'Connect Integrations',
  organization: 'Create Organization',
} as const

export const Route = createFileRoute('/_onboarding/onboarding')({
  component: OnboardingPage,
  validateSearch: (search: Record<string, unknown>) => {
    return pipe(
      Schema.decodeUnknown(OnboardingStepSchema)(search.step),
      Effect.map((step) => ({ step })),
      Effect.orElse(() => Effect.succeed({ step: OnboardingStep.organization() })),
      Effect.runSync,
    )
  },
})

function OnboardingPage() {
  const { step } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data: session } = authClient.useSession()

  const updateStep = (newStep: OnboardingStep) => {
    navigate({
      search: { step: newStep },
      to: '/onboarding',
    })
  }

  const handleIntegrationsComplete = () => {
    if (step._tag === 'integrations') {
      // Get user email from session
      const userEmail = pipe(
        session?.user?.email,
        Option.fromNullable,
        Option.getOrElse(() => 'user@example.com'),
      )

      // TODO: Send verification email
      updateStep(
        OnboardingStep['email-verification']({
          email: userEmail,
          orgName: step.orgName,
          orgSlug: step.orgSlug,
        }),
      )
    }
  }

  const handleEmailVerified = () => {
    // Navigate to main app
    navigate({ to: '/dashboard' })
  }

  return (
    <div className='m-auto flex w-full max-w-2xl flex-col items-start gap-4'>
      <OnboardingProgress
        currentStep={stepLookup[step._tag as keyof typeof stepLookup]}
        totalSteps={3}
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
              <ScrollArea className='flex flex-col'>
                <IntegrationsComponent />
              </ScrollArea>
              <ActionRow>
                <Button onClick={() => updateStep(OnboardingStep.organization())} variant='ghost'>
                  Back
                </Button>
                <Button className='ml-auto' onClick={handleIntegrationsComplete}>
                  Continue
                  <ArrowRightIcon />
                </Button>
                <Button onClick={handleIntegrationsComplete} variant='outline'>
                  Skip for now
                </Button>
              </ActionRow>
            </>
          )),
          Match.tag('email-verification', ({ email, orgName, orgSlug }) => (
            <OnboardingOTPForm
              email={email}
              onSuccess={handleEmailVerified}
              orgName={orgName}
              orgSlug={orgSlug}
            />
          )),
          Match.exhaustive,
        )(step)}
      </div>
    </div>
  )
}
