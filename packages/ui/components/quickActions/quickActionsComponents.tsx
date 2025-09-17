'use client'
import { nullOp } from '@openfaith/shared'
import { Form } from '@openfaith/ui/components/form/form'
import { ActionRow } from '@openfaith/ui/components/ui/action-row'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@openfaith/ui/components/ui/dialog'
import { Divider } from '@openfaith/ui/components/ui/divider'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@openfaith/ui/components/ui/drawer'
import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
import { Separator } from '@openfaith/ui/components/ui/separator'
import { useIsMdScreen } from '@openfaith/ui/shared/hooks/useMediaQuery'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, Option, pipe } from 'effect'
import type { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps, FC, HTMLAttributes, ReactNode } from 'react'

type QuickActionsWrapperProps = DialogPrimitive.DialogProps & {
  dialogContentClassName?: string
}

export const QuickActionsWrapper: FC<QuickActionsWrapperProps> = (props) => {
  const { children, dialogContentClassName, ...domProps } = props

  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => (
        <Drawer {...domProps}>
          <DrawerContent>{children}</DrawerContent>
        </Drawer>
      ),
      onTrue: () => (
        <Dialog {...domProps}>
          <DialogContent
            className={cn(
              `top-[clamp(16px,calc((100vh-512px)/2),192px)] flex max-h-[calc(100vh-clamp(16px,calc((100vh-512px)/2),192px)*2)] w-full translate-y-0 flex-col gap-0 overflow-hidden p-0 shadow-lg sm:max-w-3xl`,
              dialogContentClassName,
            )}
            hideCloseButton
          >
            {children}
          </DialogContent>
        </Dialog>
      ),
    }),
  )
}

export const QuickActionsHeader: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => <DrawerHeader {...props} />,
      onTrue: () => <DialogHeader {...props} />,
    }),
  )
}

export const QuickActionsTitle: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => <DrawerTitle {...props} />,
      onTrue: () => <DialogTitle {...props} />,
    }),
  )
}

export const QuickActionsDescription: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => <DrawerDescription {...props} />,
      onTrue: () => <DialogDescription {...props} />,
    }),
  )
}

const formColumnClassName = 'flex flex-col gap-3 flex-1'

type QuickActionFormProps = Omit<ComponentProps<typeof Form>, 'children'> & {
  Primary: ReactNode
  Secondary?: ReactNode
  Actions?: ReactNode
}

export const QuickActionForm: FC<QuickActionFormProps> = (props) => {
  const { Primary, Secondary, Actions, form, className, ...domProps } = props

  return (
    <>
      <Separator />

      <Form
        className={cn(
          'flex w-full flex-col items-stretch gap-0 overflow-hidden rounded-[inherit]',
          className,
        )}
        form={form}
        {...domProps}
      >
        <ScrollArea className='flex flex-col'>
          <div className='m-4 flex flex-col gap-3 md:flex-row'>
            <div className={formColumnClassName}>{Primary}</div>
            {pipe(
              Secondary,
              Option.fromNullable,
              Option.match({
                onNone: nullOp,
                onSome: (x) => (
                  <>
                    <Divider orientation={'vertical'} />
                    <div className={formColumnClassName}>{x}</div>
                  </>
                ),
              }),
            )}
          </div>
        </ScrollArea>

        <ActionRow>{Actions}</ActionRow>
      </Form>
    </>
  )
}
