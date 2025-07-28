'use client'

import { Button } from '@openfaith/ui/components/ui/button'
import { ArrowUpDownIcon } from '@openfaith/ui/icons/arrowUpDownIcon'
import { FilterKeys } from '@openfaith/ui/shared/globalState'
import { cn } from '@openfaith/ui/shared/utils'
import type { CellContext, Column } from '@tanstack/react-table'
import { format } from 'date-fns/fp'
import { pipe } from 'effect'
import type { HTMLAttributes, ReactNode } from 'react'

export type CollectionTags = 'channels' | 'prompts' | 'users' | 'orgs' | 'tags' | 'default'

export const collectionTagToFilterKey: Record<CollectionTags, FilterKeys> = {
  channels: FilterKeys.Channel,
  default: FilterKeys.Default,
  orgs: FilterKeys.Org,
  prompts: FilterKeys.Prompt,
  tags: FilterKeys.Tag,
  users: FilterKeys.User,
}

type ColumnHeaderProps<T> = {
  column: Column<T>
  children?: ReactNode
}

export const ColumnHeader = <T extends object>(props: ColumnHeaderProps<T>): ReactNode => {
  const { column, children } = props

  return (
    <Button
      className={'pr-1 pl-1'}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      variant={'ghost'}
    >
      {children}
      <ArrowUpDownIcon className={'h-3 w-4'} />
    </Button>
  )
}

type SimpleCellDisplayProps = HTMLAttributes<HTMLSpanElement>

export const SimpleCellDisplay = (props: SimpleCellDisplayProps): ReactNode => {
  const { children, className, ...domProps } = props

  return (
    <span className={cn('block flex-1 text-right font-mono', className)} {...domProps}>
      {children}
    </span>
  )
}

export const DateCell = <TData, TValue>(props: CellContext<TData, TValue>): ReactNode => {
  const { getValue } = props
  return (
    <span className={'block flex-1 text-center font-mono'}>
      {pipe(new Date(getValue<string>()), format('MMM d yyyy'))}
    </span>
  )
}
