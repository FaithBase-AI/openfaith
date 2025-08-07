'use client'

import { extractSchemaFields, getContextConfig, getVisibleFields } from '@openfaith/schema'
import { formatLabel } from '@openfaith/shared'
import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
import { useEntitySchema, useSchemaEntity } from '@openfaith/ui/shared/hooks/schemaHooks'
import { getCellRenderer } from '@openfaith/ui/table/cellRenderers'
import { Array, Option, pipe } from 'effect'
import type { FC } from 'react'

type DetailItemProps = {
  label: string
  value: any
  cellType?: string
  entityType: string
}

const DetailItem: FC<DetailItemProps> = (props) => {
  const { label, value, cellType, entityType } = props

  const CellRenderer = getCellRenderer(cellType, entityType)

  return (
    <div className={'flex items-start gap-x-3 py-2'}>
      <div className={'min-w-0 flex-1'}>
        <div className={'font-medium text-sm'}>{label}</div>
        <div className={'mt-1 text-gray-700 dark:text-gray-300'}>
          <CellRenderer
            getValue={() => value}
            row={{ original: { [label.toLowerCase()]: value } } as any}
          />
        </div>
      </div>
    </div>
  )
}

type EntityDetailsProps = {
  entityId: string
  entityType: string
}

export const EntityDetails: FC<EntityDetailsProps> = (props) => {
  const { entityId, entityType } = props

  const schemaOpt = useEntitySchema(entityType)

  // Always call the hook with fallback schema to prevent loading flash
  const fallbackSchema = { fields: [] } as any
  const entityResult = useSchemaEntity(
    Option.getOrElse(schemaOpt, () => fallbackSchema),
    entityId,
    { enabled: Option.isSome(schemaOpt) },
  )

  return pipe(
    schemaOpt,
    Option.match({
      onNone: () => (
        <ScrollArea viewportClassName={'pt-3 pb-4'}>
          <div className={'p-4'}>Schema not found for entity type: {formatLabel(entityType)}</div>
        </ScrollArea>
      ),
      onSome: (schema) => {
        const fields = extractSchemaFields(schema)
        const visibleFields = getVisibleFields(fields, 'table')

        return (
          <ScrollArea viewportClassName={'pt-3 pb-4'}>
            <div className={'flex flex-col gap-y-4 p-4'}>
              {pipe(
                entityResult.entityOpt,
                Option.match({
                  onNone: () => <div>Entity not found</div>,
                  onSome: (entityData) =>
                    pipe(
                      visibleFields,
                      Array.map((field) => {
                        const key = field.key
                        const value = (entityData as any)[key]

                        const tableConfig = getContextConfig(field, 'table') as any

                        const cellType = tableConfig?.cellType
                        const label = tableConfig?.header || formatLabel(key)

                        return (
                          <DetailItem
                            cellType={cellType}
                            entityType={entityType}
                            key={key}
                            label={label}
                            value={value}
                          />
                        )
                      }),
                    ),
                }),
              )}
            </div>
          </ScrollArea>
        )
      },
    }),
  )
}
