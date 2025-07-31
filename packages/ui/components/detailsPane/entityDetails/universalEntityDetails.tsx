'use client'

import { OfEntity } from '@openfaith/schema/shared/schema'
import { nullOp } from '@openfaith/shared'
import { DetailsShell } from '@openfaith/ui/components/detailsPane/detailsShell'
import { EntityDetailsHeader } from '@openfaith/ui/components/detailsPane/entityDetails/entityDetailsHeader'
import { EntityDetailsTabBar } from '@openfaith/ui/components/detailsPane/entityDetails/entityDetailsTabBar'
import { EntityTopBarButtons } from '@openfaith/ui/components/detailsPane/entityDetails/entityTopBarButtons'
import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
import { useSchemaCollection } from '@openfaith/ui/table/useSchemaCollection'
import { Array, Option, pipe, type Schema, SchemaAST } from 'effect'
import type { FC } from 'react'
import { useMemo } from 'react'

type EntityTab = {
  id: string
  label: string
  href?: string
  onClick?: () => void
}

export interface UniversalEntityDetailsProps<T> {
  schema: Schema.Schema<T>
  entityId: string
  data?: Array<T> // Optional - if not provided, will fetch from Zero
  activeTab?: string
  onNavigate?: (entityId: string) => void
  onTabChange?: (tabId: string) => void
  onRefresh?: () => void
  refreshLoading?: boolean
}

// Extract entity info from schema (same as UniversalTable)
const extractEntityInfo = <T,>(schema: Schema.Schema<T>) => {
  const ast = schema.ast

  const entityAnnotation = SchemaAST.getAnnotation<string>(OfEntity)(ast)

  const entityName = pipe(
    entityAnnotation,
    Option.match({
      onNone: () => 'item',
      onSome: (entity) => entity,
    }),
  )

  return {
    entityName,
    entityTag: Option.getOrUndefined(entityAnnotation),
  }
}

// Default tabs - can be enhanced to be schema-driven later
const getDefaultTabs = (): Array<EntityTab> => {
  // For now, all entities get a Details tab
  // TODO: Make this schema-driven by reading annotations
  return [{ id: 'details', label: 'Details' }]
}

// Generic content component that works with any schema
const UniversalEntityDetailsContent: FC<{
  entity: any
  schema: Schema.Schema<any>
  activeTab: string
}> = ({ entity, schema, activeTab }) => {
  const entityInfo = extractEntityInfo(schema)

  return (
    <ScrollArea viewportClassName='pt-3 pb-4 px-2'>
      <div className='flex flex-col gap-y-4'>
        <div className='p-4'>
          <h3 className='mb-4 font-semibold text-lg'>{entityInfo.entityName} Details</h3>

          {/* Generic entity details - can be enhanced with schema introspection */}
          <div className='space-y-2'>
            <div>
              <span className='font-medium'>ID:</span> {entity.id}
            </div>
            <div>
              <span className='font-medium'>Type:</span> {entity._tag}
            </div>
            {entity.name && (
              <div>
                <span className='font-medium'>Name:</span> {entity.name}
              </div>
            )}
            <div>
              <span className='font-medium'>Active Tab:</span> {activeTab}
            </div>
          </div>

          {/* TODO: Add schema-driven field rendering here */}
          <div className='mt-4 rounded-md bg-muted p-3'>
            <p className='text-muted-foreground text-sm'>
              Schema-driven details will be implemented here using the same pattern as
              UniversalTable's column generation.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

export const UniversalEntityDetails = <T,>(props: UniversalEntityDetailsProps<T>) => {
  const {
    schema,
    entityId,
    data,
    activeTab = 'details',
    onNavigate = nullOp,
    onTabChange = nullOp,
    onRefresh,
    refreshLoading = false,
  } = props

  const entityInfo = useMemo(() => {
    return extractEntityInfo(schema)
  }, [schema])

  // Get collection data (same pattern as UniversalTable)
  const collectionResult = useSchemaCollection(schema, {
    enabled: !data,
    limit: 100,
    pageSize: 20,
  })

  const finalData = data || collectionResult.data

  // Find the current entity in the collection
  const currentEntity = useMemo(() => {
    return pipe(
      finalData,
      Array.findFirst((item: any) => item.id === entityId),
    )
  }, [finalData, entityId])

  const tabs = useMemo(() => {
    const defaultTabs = getDefaultTabs()
    return defaultTabs.map((tab) => ({
      ...tab,
      onClick: () => onTabChange(tab.id),
    }))
  }, [onTabChange])

  return pipe(
    currentEntity,
    Option.match({
      onNone: () => (
        <div className='p-4'>
          <p>Entity not found: {entityId}</p>
        </div>
      ),
      onSome: (entity) => (
        <DetailsShell
          content={
            <UniversalEntityDetailsContent activeTab={activeTab} entity={entity} schema={schema} />
          }
          header={<EntityDetailsHeader entity={entity} />}
          tabBar={
            <EntityDetailsTabBar
              activeTab={activeTab}
              entityId={entityId}
              entityType={entityInfo.entityTag || 'item'}
              onRefresh={onRefresh}
              refreshLoading={refreshLoading}
              tabs={tabs}
            />
          }
          topBarButtons={
            <EntityTopBarButtons
              currentEntityId={entityId}
              entityCollection={finalData}
              entityType={entityInfo.entityTag || 'item'}
              onNavigate={onNavigate}
            />
          }
        />
      ),
    }),
  )
}
