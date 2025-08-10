'use client'

import { Input } from '@openfaith/ui/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@openfaith/ui/components/ui/toggle-group'
import { SearchIcon } from '@openfaith/ui/icons/searchIcon'
import { ViewCardIcon } from '@openfaith/ui/icons/viewCardIcon'
import { ViewListIcon } from '@openfaith/ui/icons/viewListIcon'
import {
  collectionViewsAtom,
  getCollectionView,
  setCollectionView,
} from '@openfaith/ui/shared/globalState'
import { cn } from '@openfaith/ui/shared/utils'
import { useAtom } from 'jotai'
import type { ReactNode } from 'react'
import { useCallback } from 'react'

type CollectionToolbarDataGridProps = {
  _tag: string
  Actions?: ReactNode
  className?: string
  filterPlaceHolder: string
  onSearchChange: (value: string) => void
  searchValue: string
}

export const CollectionToolbarDataGrid = (props: CollectionToolbarDataGridProps): ReactNode => {
  const { _tag, Actions, className, filterPlaceHolder, onSearchChange, searchValue } = props

  const [collectionViews, setCollectionViews] = useAtom(collectionViewsAtom)
  const collectionView = getCollectionView(collectionViews, _tag)

  const handleViewChange = useCallback(
    (value: string) => {
      if (value === 'cards' || value === 'table') {
        setCollectionViews(setCollectionView(collectionViews, _tag, value))
      }
    },
    [_tag, collectionViews, setCollectionViews],
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className='flex flex-1 items-center gap-2'>
        {/* Search Input */}
        <div className='relative flex-1 md:max-w-sm'>
          <SearchIcon className='-translate-y-1/2 absolute top-1/2 left-2 size-4 text-muted-foreground' />
          <Input
            className='pl-8'
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={filterPlaceHolder}
            value={searchValue}
          />
        </div>

        {/* Filters - TODO: Add filter UI */}
      </div>

      <div className='flex items-center gap-2'>
        {/* Actions */}
        {Actions}

        {/* View Toggle - Hidden for now since we only support table view */}
        <ToggleGroup
          className='hidden'
          onValueChange={handleViewChange}
          type='single'
          value={collectionView}
        >
          <ToggleGroupItem aria-label='Table view' value='table'>
            <ViewListIcon className='size-4' />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label='Card view' value='cards'>
            <ViewCardIcon className='size-4' />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
