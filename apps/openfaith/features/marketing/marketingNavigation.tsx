import { Logo } from '@openfaith/openfaith/components/logo'
import { MainNav } from '@openfaith/openfaith/features/marketing/mainNav'
import { marketingSideSpacing } from '@openfaith/openfaith/features/marketing/marketingGlobals'
import { MobileMarketingNavigation } from '@openfaith/openfaith/features/marketing/mobileMarketingNavigation'
import { RightNav } from '@openfaith/openfaith/features/marketing/rightNav'
import { UserNav } from '@openfaith/openfaith/features/marketing/userNav'
import { cn, ThemeToggle } from '@openfaith/ui'
import { Link, useRouter } from '@tanstack/react-router'
import type { FC } from 'react'

const MarketingNavigation: FC = () => {
  const router = useRouter()

  return (
    <>
      <MainNav />

      <div className={'ml-auto hidden items-center gap-2 md:flex'}>
        <RightNav />
        <ThemeToggle className='rounded-full' />
        <UserNav className='text-inherit' session={router.options.context.session.data} />
      </div>

      <div className={'ml-auto flex items-center gap-2 md:hidden'}>
        <ThemeToggle className='rounded-full' />
        <MobileMarketingNavigation session={router.options.context.session.data} />
      </div>
    </>
  )
}

const MarketingNavigationWrapper: FC = () => {
  return (
    <div
      className={
        'fixed absolute top-0 right-0 left-0 z-20 overflow-hidden bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60'
      }
    >
      <div
        className={cn(
          marketingSideSpacing,
          'flex items-center justify-between overflow-hidden py-3',
        )}
      >
        <Link to='/'>
          <Logo className='h-8 text-inherit' variant='wordmark' />
        </Link>
        <MarketingNavigation />
      </div>
    </div>
  )
}

export { MarketingNavigationWrapper as MarketingNavigation }
