'use client'

import { AppButton } from '@openfaith/openfaith/features/marketing/appButton'
import { Button, cn, Drawer, DrawerContent, DrawerTrigger, useMetaColor } from '@openfaith/ui'
import { Link, type LinkProps, useRouter } from '@tanstack/react-router'
import { Option, pipe } from 'effect'
import { type FC, type ReactNode, useCallback, useState } from 'react'

type MobileMarketingNavigationProps = {
  className?: string
}

export const MobileMarketingNavigation: FC<MobileMarketingNavigationProps> = (props) => {
  const { className, ...domProps } = props
  const router = useRouter()
  const session = router.options.context.session.data

  const [open, setOpen] = useState(false)
  const { setMetaColor, metaColor } = useMetaColor()

  const onOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open)
      setMetaColor(open ? '#09090b' : metaColor)
    },
    [setMetaColor, metaColor],
  )

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerTrigger asChild>
        <Button
          className={cn(
            'h-8 gap-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden',
            className,
          )}
          variant='ghost'
          {...domProps}
        >
          <svg
            className='size-6!'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M3.75 9h16.5m-16.5 6.75h16.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          <span className='sr-only'>Toggle Menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className='max-h-[80svh] p-0'>
        <div className='overflow-auto p-6'>
          <div className='flex flex-col space-y-3'>
            <MobileLink href='/' onOpenChange={setOpen}>
              Home
            </MobileLink>

            <MobileLink href='/features' onOpenChange={setOpen}>
              Features
            </MobileLink>

            <MobileLink href='/integrations' onOpenChange={setOpen}>
              Integrations
            </MobileLink>

            <MobileLink href='/pricing' onOpenChange={setOpen}>
              Pricing
            </MobileLink>

            <MobileLink href='/vision' onOpenChange={setOpen}>
              Vision
            </MobileLink>

            <MobileLink href='/blog' onOpenChange={setOpen}>
              Blog
            </MobileLink>

            {pipe(
              session,
              Option.fromNullable,
              Option.match({
                onNone: () => (
                  <MobileLink href='/sign-in' onOpenChange={setOpen}>
                    Sign In
                  </MobileLink>
                ),
                onSome: () => <AppButton />,
              }),
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  className?: string
}

function MobileLink({ to, onOpenChange, className, children, ...props }: MobileLinkProps) {
  const router = useRouter()

  return (
    <Link
      className={cn('text-[1.15rem]', className)}
      onClick={() => {
        router.history.push(
          pipe(
            to,
            Option.fromNullable,
            Option.getOrElse(() => '/'),
          ),
        )
        onOpenChange?.(false)
      }}
      to={to}
      {...props}
    >
      {children}
    </Link>
  )
}
