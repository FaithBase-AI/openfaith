import { cn } from '@openfaith/ui/shared/utils'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ComponentProps, FC } from 'react'

export const MainContainer: FC<ComponentProps<'main'>> = (props) => {
  const { children, className, ...domProps } = props

  return (
    <main
      className={cn('flex flex-1 flex-col overflow-hidden', className)}
      data-slot='main-container'
      {...domProps}
    >
      {children}
    </main>
  )
}

export const PageContainer: FC<
  ComponentProps<typeof ScrollArea> & { wrapperClassName?: string }
> = (props) => {
  const { children, className, wrapperClassName, ...domProps } = props

  return (
    <ScrollArea className={className} data-slot='page-container' {...domProps}>
      <PageWrapper className={wrapperClassName}>{children}</PageWrapper>
    </ScrollArea>
  )
}

export const pageWrapperSpacing = 'px-4 py-4 pt-3 md:px-8 md:pt-6'

const pageWrapperVariants = cva(['flex flex-col', pageWrapperSpacing], {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: '',
      noPageContainer: 'flex-1 overflow-hidden',
    },
  },
})

export const PageWrapper: FC<ComponentProps<'div'> & VariantProps<typeof pageWrapperVariants>> = (
  props,
) => {
  const { children, className, variant, ...domProps } = props

  return (
    <div
      className={cn(pageWrapperVariants({ variant }), className)}
      data-slot='page-wrapper'
      {...domProps}
    >
      {children}
    </div>
  )
}
