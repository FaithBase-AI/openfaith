'use client'

import { nullOp } from '@openfaith/shared'
import { Button } from '@openfaith/ui/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@openfaith/ui/components/ui/tabs'
import { RefreshIcon } from '@openfaith/ui/icons/refreshIcon'
import type { FC, ReactNode } from 'react'

type EntityTab = {
  id: string
  label: string
  href?: string
  onClick?: () => void
}

type EntityDetailsTabBarProps = {
  entityId: string
  entityType: string
  activeTab: string
  tabs: Array<EntityTab>
  actions?: ReactNode
  onRefresh?: () => void
  refreshLoading?: boolean
}

export const EntityDetailsTabBar: FC<EntityDetailsTabBarProps> = (props) => {
  const { activeTab, tabs, actions, onRefresh, refreshLoading = false } = props

  return (
    <div className='flex w-full flex-row gap-2'>
      <Tabs className='relative z-10 flex flex-1 flex-row' value={activeTab}>
        <TabsList className='flex-1 justify-start'>
          {tabs.map((tab) => (
            <TabsTrigger asChild={!!tab.href} key={tab.id} value={tab.id}>
              {tab.href ? (
                <a href={tab.href} onClick={tab.onClick || nullOp}>
                  {tab.label}
                </a>
              ) : (
                <button onClick={tab.onClick || nullOp}>{tab.label}</button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Action buttons */}
      <div className='flex items-center gap-2'>
        {actions}

        {onRefresh && (
          <Button
            className='h-8.5'
            loading={refreshLoading}
            onClick={onRefresh}
            size='sm'
            variant='outline'
          >
            <RefreshIcon />
            Refresh
          </Button>
        )}
      </div>
    </div>
  )
}
