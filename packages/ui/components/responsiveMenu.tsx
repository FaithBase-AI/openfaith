import { Drawer, DrawerContent, DrawerTrigger } from '@openfaith/ui/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  dropdownMenuItemVariants,
  dropdownMenuLabelVariants,
  dropdownMenuSeparatorVariants,
} from '@openfaith/ui/components/ui/dropdown-menu'
import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
import { useIsMdScreen } from '@openfaith/ui/shared/hooks/useMediaQuery'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, pipe } from 'effect'
import type { ComponentPropsWithoutRef, FC } from 'react'

export const ResponsiveMenu: FC<ComponentPropsWithoutRef<typeof DropdownMenu>> = (props) => {
  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => <Drawer {...props} />,
      onTrue: () => <DropdownMenu {...props} />,
    }),
  )
}

export const ResponsiveMenuTrigger: FC<ComponentPropsWithoutRef<typeof DropdownMenuTrigger>> = (
  props,
) => {
  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => <DrawerTrigger {...props} />,
      onTrue: () => <DropdownMenuTrigger {...props} />,
    }),
  )
}

export const ResponsiveMenuContent: FC<ComponentPropsWithoutRef<typeof DropdownMenuContent>> = (
  props,
) => {
  const { children, ...domProps } = props

  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => (
        <DrawerContent {...domProps}>
          <ScrollArea viewportClassName={'overflow-x-hidden!'}>{children}</ScrollArea>
        </DrawerContent>
      ),
      onTrue: () => <DropdownMenuContent {...domProps}>{children}</DropdownMenuContent>,
    }),
  )
}

export const ResponsiveMenuLabel: FC<ComponentPropsWithoutRef<typeof DropdownMenuLabel>> = (
  props,
) => {
  const { inset, className, ...domProps } = props

  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => (
        <div
          className={cn(dropdownMenuLabelVariants(), className)}
          data-inset={inset}
          {...domProps}
        />
      ),
      onTrue: () => <DropdownMenuLabel className={className} inset={inset} {...domProps} />,
    }),
  )
}
export const ResponsiveMenuSeparator: FC<ComponentPropsWithoutRef<typeof DropdownMenuSeparator>> = (
  props,
) => {
  const { className, ...domProps } = props

  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => (
        <div className={cn(dropdownMenuSeparatorVariants(), className)} {...domProps} />
      ),
      onTrue: () => <DropdownMenuSeparator className={className} {...domProps} />,
    }),
  )
}
export const ResponsiveMenuItem: FC<ComponentPropsWithoutRef<typeof DropdownMenuItem>> = (
  props,
) => {
  const { className, ...domProps } = props

  const isMdScreen = useIsMdScreen()

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => (
        // @ts-expect-error
        <div
          className={cn(dropdownMenuItemVariants(), className)}
          data-inset={false}
          {...domProps}
        />
      ),
      onTrue: () => <DropdownMenuItem className={className} {...domProps} />,
    }),
  )
}
