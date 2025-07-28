'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@openfaith/ui/components/ui/dialog'
import { Drawer, DrawerContent } from '@openfaith/ui/components/ui/drawer'
import { cn } from '@openfaith/ui/shared/utils'
import * as React from 'react'

type SheetProps = React.ComponentProps<typeof Dialog> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
}

function Sheet({ side = 'right', ...props }: SheetProps) {
  // For mobile, use drawer; for desktop, use dialog
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return <Drawer {...props} />
  }

  return <Dialog {...props} />
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof DialogContent> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <DrawerContent className={cn(className)} {...props}>
        {children}
      </DrawerContent>
    )
  }

  const sideClasses = {
    bottom:
      'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
    right:
      'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
    top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  }

  return (
    <DialogContent
      className={cn(
        'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-300 data-[state=open]:duration-500',
        sideClasses[side],
        className,
      )}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle className={cn(className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription className={cn(className)} {...props} />
}

export { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle }
