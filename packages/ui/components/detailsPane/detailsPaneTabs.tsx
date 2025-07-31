import { Button } from '@openfaith/ui/components/ui/button'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, pipe } from 'effect'
import type { FC } from 'react'

type DetailsPaneTabsProps = {
  tabs: Array<{
    id: string
    label: string
    href?: string
    onClick?: () => void
  }>
  activeTab: string
  className?: string
}

export const DetailsPaneTabs: FC<DetailsPaneTabsProps> = (props) => {
  const { tabs, activeTab, className } = props

  return (
    <div className={cn('flex flex-row gap-1.5', className)}>
      {pipe(tabs, (tabList) =>
        tabList.map((tab) => (
          <DetailsPaneTab
            href={tab.href}
            id={tab.id}
            isActive={tab.id === activeTab}
            key={tab.id}
            label={tab.label}
            onClick={tab.onClick}
          />
        )),
      )}
    </div>
  )
}

type DetailsPaneTabProps = {
  id: string
  label: string
  href?: string
  onClick?: () => void
  isActive: boolean
}

const DetailsPaneTab: FC<DetailsPaneTabProps> = (props) => {
  const { label, href, onClick, isActive } = props

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Button
      asChild={!!href}
      className={cn(
        'font-medium text-sm',
        pipe(
          isActive,
          Boolean.match({
            onFalse: () => 'text-muted-foreground hover:text-foreground',
            onTrue: () => 'text-foreground',
          }),
        ),
      )}
      onClick={handleClick}
      size='sm'
      variant={pipe(
        isActive,
        Boolean.match({
          onFalse: () => 'ghost' as const,
          onTrue: () => 'secondary' as const,
        }),
      )}
    >
      {href ? <a href={href}>{label}</a> : <span>{label}</span>}
    </Button>
  )
}
