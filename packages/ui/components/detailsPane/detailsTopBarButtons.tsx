'use client'

import { formatLabel, nullOp, pluralize } from '@openfaith/shared'
import { Button } from '@openfaith/ui/components/ui/button'
import { ShortcutKey } from '@openfaith/ui/components/ui/shortcut-key'
import { Tooltip, TooltipContent, TooltipTrigger } from '@openfaith/ui/components/ui/tooltip'
import { ChevronDownIcon } from '@openfaith/ui/icons/chevronDownIcon'
import { ChevronUpIcon } from '@openfaith/ui/icons/chevronUpIcon'
import { Array, Boolean, Option, pipe } from 'effect'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

type DetailsTopBarButtonsProps<T extends { id: string }> = {
  id: string
  collection: ReadonlyArray<T>
  entityType: string
  onNavigate?: (id: string) => void
}

export const DetailsTopBarButtons = <T extends { id: string }>(
  props: DetailsTopBarButtonsProps<T>,
): ReactNode => {
  const { id, collection, entityType, onNavigate = nullOp } = props

  const indexOpt = useMemo(
    () =>
      pipe(
        collection,
        Array.findFirstIndex((x) => x.id === id),
      ),
    [collection, id],
  )

  const getNeighborItem = (direction: 'increment' | 'decrement') =>
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

  const navigateToPrevious = () => {
    pipe(
      getNeighborItem('decrement'),
      Option.match({
        onNone: nullOp,
        onSome: (item) => onNavigate(item.id),
      }),
    )
  }

  const navigateToNext = () => {
    pipe(
      getNeighborItem('increment'),
      Option.match({
        onNone: nullOp,
        onSome: (item) => onNavigate(item.id),
      }),
    )
  }

  useHotkeys(['k'], navigateToPrevious, { enabled: !isFirstItem })
  useHotkeys(['j'], navigateToNext, { enabled: !isLastItem })

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={isFirstItem}
            onClick={navigateToPrevious}
            size={'icon-sm'}
            variant={'secondary'}
          >
            <ChevronUpIcon className={'size-4'} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className={'inline-flex gap-2'}>
          Previous record <ShortcutKey keys={['k']} />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={isLastItem}
            onClick={navigateToNext}
            size={'icon-sm'}
            variant={'secondary'}
          >
            <ChevronDownIcon className={'size-4'} />
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
