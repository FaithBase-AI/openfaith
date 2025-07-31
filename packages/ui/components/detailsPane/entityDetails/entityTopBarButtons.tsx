'use client'

import { nullOp } from '@openfaith/shared'
import { Button } from '@openfaith/ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@openfaith/ui/components/ui/tooltip'
import { ChevronDownIcon } from '@openfaith/ui/icons/chevronDownIcon'
import { ChevronUpIcon } from '@openfaith/ui/icons/chevronUpIcon'
import { Array, Option, pipe } from 'effect'
import type { FC } from 'react'
import { useMemo } from 'react'

type EntityTopBarButtonsProps = {
  currentEntityId: string
  entityCollection: ReadonlyArray<any>
  entityType: string
  onNavigate?: (entityId: string) => void
}

export const EntityTopBarButtons: FC<EntityTopBarButtonsProps> = (props) => {
  const { currentEntityId, entityCollection, entityType, onNavigate = nullOp } = props

  const currentIndex = useMemo(
    () =>
      pipe(
        entityCollection,
        Array.findFirstIndex((x) => x.id === currentEntityId),
      ),
    [entityCollection, currentEntityId],
  )

  const canNavigatePrevious = useMemo(
    () =>
      pipe(
        currentIndex,
        Option.match({
          onNone: () => false,
          onSome: (index) => index > 0,
        }),
      ),
    [currentIndex],
  )

  const canNavigateNext = useMemo(
    () =>
      pipe(
        currentIndex,
        Option.match({
          onNone: () => false,
          onSome: (index) => index < entityCollection.length - 1,
        }),
      ),
    [currentIndex, entityCollection.length],
  )

  const handleNavigate = (direction: 'previous' | 'next') => {
    pipe(
      currentIndex,
      Option.flatMap((index) => {
        const newIndex = direction === 'previous' ? index - 1 : index + 1
        return pipe(entityCollection, Array.get(newIndex))
      }),
      Option.match({
        onNone: nullOp,
        onSome: (entity) => onNavigate(entity.id),
      }),
    )
  }

  const displayType = useMemo(() => {
    // Capitalize and pluralize entity type
    const capitalized = entityType.charAt(0).toUpperCase() + entityType.slice(1)
    return `${capitalized}s` // Simple pluralization
  }, [entityType])

  const currentPosition =
    pipe(
      currentIndex,
      Option.getOrElse(() => 0),
    ) + 1

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={!canNavigatePrevious}
            onClick={() => handleNavigate('previous')}
            size='icon-sm'
            variant='secondary'
          >
            <ChevronUpIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent className='inline-flex gap-2'>Previous record</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={!canNavigateNext}
            onClick={() => handleNavigate('next')}
            size='icon-sm'
            variant='secondary'
          >
            <ChevronDownIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent className='inline-flex gap-2'>Next record</TooltipContent>
      </Tooltip>

      <p className='text-muted-foreground text-sm'>
        {currentPosition} of {entityCollection.length} in {displayType}
      </p>
    </>
  )
}
