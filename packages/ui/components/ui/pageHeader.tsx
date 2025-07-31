import { cn } from '@openfaith/ui/shared/utils'
import type { ComponentProps, FC, ReactNode } from 'react'

type PageHeaderProps = Omit<ComponentProps<'div'>, 'children'> & {
  Title: ReactNode
  hideLiveAvatars?: boolean
  hideNotifications?: boolean
  PreActions?: ReactNode
  PostActions?: ReactNode
}

export const PageHeader: FC<PageHeaderProps> = (props) => {
  const {
    Title,
    hideLiveAvatars = false,
    hideNotifications = false,
    PreActions,
    PostActions,
    ...domProps
  } = props

  return (
    <PageHeaderContainer {...domProps}>
      <PageHeaderTitle>{Title}</PageHeaderTitle>

      <PageHeaderActions
        hideLiveAvatars={hideLiveAvatars}
        hideNotifications={hideNotifications}
        PostActions={PostActions}
        PreActions={PreActions}
      />
    </PageHeaderContainer>
  )
}

export const PageHeaderTitle: FC<ComponentProps<'h2'>> = (props) => {
  const { className, children, ...domProps } = props

  return (
    <h2
      className={cn('truncate font-display font-semibold text-xl md:text-2xl', className)}
      data-slot='page-header-title'
      {...domProps}
    >
      {children}
    </h2>
  )
}

export const PageHeaderContainer: FC<ComponentProps<'div'>> = (props) => {
  const { className, ...domProps } = props

  return (
    <div
      className={cn('flex h-16 shrink-0 items-center px-4 md:px-4', className)}
      data-slot='page-header-container'
      {...domProps}
    />
  )
}

type PageHeaderActionsProps = Omit<ComponentProps<'div'>, 'children'> & {
  hideLiveAvatars?: boolean
  hideNotifications?: boolean
  PreActions?: ReactNode
  PostActions?: ReactNode
}

export const pageHeaderActionsClassName = 'ml-auto mr-0 flex flex-row items-center gap-3'

export const PageHeaderActions: FC<PageHeaderActionsProps> = (props) => {
  const {
    className,
    hideLiveAvatars: _hideLiveAvatars = false,
    hideNotifications: _hideNotifications = false,
    PreActions,
    PostActions,
    ...domProps
  } = props

  return (
    <div
      className={cn(pageHeaderActionsClassName, className)}
      data-slot='page-header-actions'
      {...domProps}
    >
      {PreActions}

      {PostActions}
    </div>
  )
}
