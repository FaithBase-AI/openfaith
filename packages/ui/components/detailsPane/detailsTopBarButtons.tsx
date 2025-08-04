'use client'

import { asyncNoOp, formatLabel, pluralize } from '@openfaith/shared'
import { useChangeDetailsPaneEntityId } from '@openfaith/ui/components/detailsPane/detailsPaneHelpers'
import { Button } from '@openfaith/ui/components/ui/button'
import { ShortcutKey } from '@openfaith/ui/components/ui/shortcut-key'
import { Tooltip, TooltipContent, TooltipTrigger } from '@openfaith/ui/components/ui/tooltip'
import { ChevronDownIcon } from '@openfaith/ui/icons/chevronDownIcon'
import { ChevronUpIcon } from '@openfaith/ui/icons/chevronUpIcon'
import { Link } from '@tanstack/react-router'
import { Array, Boolean, Option, pipe } from 'effect'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

type DetailsTopBarButtonsProps<T extends { id: string }> = {
  id: string
  collection: ReadonlyArray<T>
  entityType: string
}

export const DetailsTopBarButtons = <T extends { id: string }>(
  props: DetailsTopBarButtonsProps<T>,
): ReactNode => {
  const { id, collection, entityType } = props
  const changeDetailsPaneEntityId = useChangeDetailsPaneEntityId()

  const indexOpt = useMemo(
    () =>
      pipe(
        collection,
        Array.findFirstIndex((x) => x.id === id),
      ),
    [collection, id],
  )

  const getNeighborItemNavigation = (direction: 'increment' | 'decrement') =>
    pipe(
      indexOpt,
      Option.filter((x) =>
        pipe(
          direction === 'increment',
          Boolean.match({
            onFalse: () => x !== 0,
            onTrue: () => x + 1 !== collection.length,
          }),
        ),
      ),
      Option.flatMap((x) =>
        pipe(
          collection,
          Array.get(
            pipe(
              direction === 'increment',
              Boolean.match({ onFalse: () => x - 1, onTrue: () => x + 1 }),
            ),
          ),
        ),
      ),
      Option.match({
        onNone: () => ({
          forceNav: asyncNoOp,
          onClick: asyncNoOp,
          search: (prev: any) => prev,
          to: '.',
        }),
        onSome: (item) => changeDetailsPaneEntityId(item.id, entityType),
      }),
    )

  const displayType = useMemo(() => {
    return pipe(entityType, formatLabel, pluralize)
  }, [entityType])

  const currentIndex = pipe(
    indexOpt,
    Option.getOrElse(() => 0),
  )
  const isFirstItem = currentIndex === 0
  const isLastItem = currentIndex + 1 === collection.length

  useHotkeys(['k'], getNeighborItemNavigation('decrement').forceNav)
  useHotkeys(['j'], getNeighborItemNavigation('increment').forceNav)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild disabled={isFirstItem} size={'icon-sm'} variant={'secondary'}>
            <Link {...getNeighborItemNavigation('decrement')}>
              <ChevronUpIcon className={'size-4'} />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent className={'inline-flex gap-2'}>
          Previous record <ShortcutKey keys={['k']} />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild disabled={isLastItem} size={'icon-sm'} variant={'secondary'}>
            <Link {...getNeighborItemNavigation('increment')}>
              <ChevronDownIcon className={'size-4'} />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent className={'inline-flex gap-2'}>
          Next record <ShortcutKey keys={['j']} />
        </TooltipContent>
      </Tooltip>

      <p className={'text-muted-foreground text-sm'}>
        {currentIndex + 1} of {collection.length} in {displayType}
      </p>
    </>
  )
}
