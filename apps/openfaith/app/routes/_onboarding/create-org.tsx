import { OrgForm } from '@openfaith/openfaith/features/auth/orgForm'
import { GroupIcon, Separator } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Schema } from 'effect'

const CreateOrgSearch = Schema.Struct({
  redirect: Schema.String.pipe(Schema.optional),
})

export const Route = createFileRoute('/_onboarding/create-org')({
  component: RouteComponent,
  validateSearch: Schema.decodeUnknownSync(CreateOrgSearch),
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return (
    <div className='m-auto flex w-full max-w-2xl flex-col items-start gap-4'>
      <div className='m-auto w-full gap-0 overflow-hidden rounded-2xl border border-neutral-200 p-0 shadow-2xl'>
        <div className={'flex flex-col space-y-1.5 p-4 text-center sm:text-left'}>
          <span className='font-semibold text-lg leading-none tracking-tight'>
            <span className={'inline-flex flex-row items-center'}>
              <GroupIcon className={'mr-2 size-4'} />
              Create Organization
            </span>
          </span>
        </div>

        <Separator />

        <OrgForm _tag={'onboarding'} redirect={redirect} />
      </div>
    </div>
  )
}
