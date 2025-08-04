import { useEntitySchema } from '@openfaith/schema'
import { DetailsShell } from '@openfaith/ui/components/detailsPane/detailsShell'
import { EntityDetails } from '@openfaith/ui/components/detailsPane/entityDetails'
import { EntityDetailsHeader } from '@openfaith/ui/components/detailsPane/entityDetailsHeader'
import { EntityDetailsTabBar } from '@openfaith/ui/components/detailsPane/entityDetailsTabBar'
import { EntityTopBarButtons } from '@openfaith/ui/components/detailsPane/entityTopBarButtons'
import { Option } from 'effect'
import type { FC } from 'react'
import { useMemo } from 'react'

type EntityDetailsPaneProps = {
  entityId: string
  entityType: string
  tab: string
}

export const EntityDetailsPane: FC<EntityDetailsPaneProps> = (props) => {
  const { entityId, entityType, tab } = props

  const schemaOpt = useEntitySchema(entityType)

  const RenderTab = useMemo(() => {
    switch (tab) {
      case 'relationships':
        return <div className='p-4'>Relationships coming soon...</div>
      case 'history':
        return <div className='p-4'>History coming soon...</div>
      default:
        return <EntityDetails entityId={entityId} entityType={entityType} />
    }
  }, [entityId, entityType, tab])

  return (
    <DetailsShell
      content={RenderTab}
      header={<EntityDetailsHeader entityId={entityId} entityType={entityType} />}
      tabBar={<EntityDetailsTabBar activeTab={tab} entityId={entityId} entityType={entityType} />}
      topBarButtons={Option.match(schemaOpt, {
        onNone: () => null,
        onSome: (schema) => (
          <EntityTopBarButtons entityId={entityId} entityType={entityType} schema={schema} />
        ),
      })}
    />
  )
}
