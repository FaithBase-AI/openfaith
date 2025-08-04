import { formatLabel } from '@openfaith/shared'
import { useOpenEntityDetailsPaneTabUrl } from '@openfaith/ui/components/detailsPane/detailsPaneHelpers'
import { Tabs, TabsList, TabsTrigger } from '@openfaith/ui/components/ui/tabs'
import { Link } from '@tanstack/react-router'
import { Array, pipe } from 'effect'
import type { FC } from 'react'

type EntityDetailsTabBarProps = {
  entityId: string
  entityType: string
  activeTab: string
  onTabChange?: (tab: string) => void
}

export const EntityDetailsTabBar: FC<EntityDetailsTabBarProps> = (props) => {
  const { entityId, entityType, activeTab, onTabChange } = props

  const availableTabs = ['details', 'relationships', 'history']
  const openEntityDetailsPaneTabUrl = useOpenEntityDetailsPaneTabUrl({
    entityId,
    entityType,
  })

  return (
    <div className='flex w-full flex-row gap-2'>
      <Tabs
        className='relative z-10 flex flex-1 flex-row'
        defaultValue='details'
        onValueChange={onTabChange}
        value={activeTab}
      >
        <TabsList className='flex-1 justify-start'>
          {pipe(
            availableTabs,
            Array.map((tab) => (
              <TabsTrigger asChild key={tab} value={tab}>
                <Link {...openEntityDetailsPaneTabUrl(tab)}>{formatLabel(tab)}</Link>
              </TabsTrigger>
            )),
          )}
        </TabsList>
      </Tabs>
    </div>
  )
}
