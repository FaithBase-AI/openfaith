import { getSession } from '@openfaith/openfaith/app/server/getSession'
import { Logo } from '@openfaith/openfaith/components/logo'
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { Option, pipe } from 'effect'

export const Route = createFileRoute('/_onboarding')({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    const session = await getSession()

    if (!session) {
      console.log('(onboarding) - no session, send to sign-in')
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: ctx.location.href,
        },
      })
    }

    return {
      ...ctx.context,
      userId: session.session.userId,
      orgId: pipe(session.session.activeOrganizationId, Option.fromNullable, Option.getOrNull),
    }
  },
})

function RouteComponent() {
  return (
    <div
      className={
        'flex min-h-screen w-full shrink-0 flex-col bg-linear-to-br from-emerald-800 to-emerald-700 md:flex-row'
      }
    >
      <div className={'flex shrink-0 flex-col md:w-[36%] md:max-w-[500px] lg:w-[40%]'}>
        <div className='relative flex h-full flex-col items-start overflow-hidden px-6 pt-6 text-white md:p-8'>
          <Logo variant='wordmark' className='h-12 w-auto' />

          <Logo
            className='-translate-y-1/2 absolute top-[50%] right-[-70%] h-[80vh] w-auto'
            leftFill='#ffffff05'
            centerFill='#ffffff05'
            rightFill='#ffffff05'
          />

          <div className='mt-4 flex flex-col gap-4 md:mt-24'>
            <p className='font-semibold text-amber-500 text-sm uppercase'>Get Started</p>

            <p className='font-bold text-5xl'>Welcome!</p>

            <p className='text-md text-white/60'>
              Your gateway to seeing all your data in one place.
            </p>
          </div>

          <div className='mt-auto hidden flex-row gap-2 text-white/70 md:flex'>
            <Link to='/'>Home</Link>
          </div>
        </div>
      </div>

      <div
        className={
          'm-4 flex h-full w-auto flex-col rounded-3xl bg-background p-4 md:my-4 md:mr-4 md:h-auto md:flex-1 md:p-8'
        }
      >
        <Outlet />
      </div>
    </div>
  )
}
