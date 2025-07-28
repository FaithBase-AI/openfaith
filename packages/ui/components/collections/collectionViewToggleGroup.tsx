'use client'

import type { CollectionTags } from '@openfaith/ui/components/collections/collectionComponents'
import { ToggleGroup, ToggleGroupItem } from '@openfaith/ui/components/ui/toggle-group'
import { ViewCardIcon } from '@openfaith/ui/icons/viewCardIcon'
import { ViewListIcon } from '@openfaith/ui/icons/viewListIcon'
import {
  collectionViewsAtom,
  getCollectionView,
  setCollectionView,
} from '@openfaith/ui/shared/globalState'
import { useAtom } from 'jotai'
import type { ComponentPropsWithoutRef, FC } from 'react'

type CollectionViewToggleGroupProps = Omit<
  ComponentPropsWithoutRef<typeof ToggleGroup>,
  'value' | 'onValueChange' | 'defaultValue' | 'type'
> & {
  _tag: CollectionTags
}

export const CollectionViewToggleGroup: FC<CollectionViewToggleGroupProps> = (props) => {
  const { _tag, ...domProps } = props

  const [collectionViews, setCollectionViews] = useAtom(collectionViewsAtom)
  const collectionView = getCollectionView(collectionViews, _tag)

  return (
    <ToggleGroup
      onValueChange={(x) => {
        if (x === 'table' || x === 'cards') {
          setCollectionViews((currentViews) => setCollectionView(currentViews, _tag, x))
        }
      }}
      type={'single'}
      value={collectionView}
      {...domProps}
    >
      <ToggleGroupItem label={'Card View'} value={'cards'}>
        <ViewCardIcon className={'size-4'} />
      </ToggleGroupItem>

      <ToggleGroupItem label={'Table View'} value={'table'}>
        <ViewListIcon className={'size-4'} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
