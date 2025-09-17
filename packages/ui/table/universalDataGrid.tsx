'use client'

import '@glideapps/glide-data-grid/dist/index.css'

import type { GridCell, Item, Rectangle } from '@glideapps/glide-data-grid'
import { GridCellKind } from '@glideapps/glide-data-grid'
import type { Edge } from '@openfaith/db'
import { extractEntityInfo } from '@openfaith/schema'
import { CollectionDataGrid } from '@openfaith/ui/components/collections/collectionDataGrid'
import { Button } from '@openfaith/ui/components/ui/button'
import {
  buildEntityRelationshipsForTable,
  useEntityNamesFetcher,
  useSchemaCollection,
  useSchemaUpdate,
} from '@openfaith/ui/shared/hooks/schemaHooks'
import {
  getActionsCell,
  getGridCellContent,
  getRelationCell,
} from '@openfaith/ui/table/dataGridCellContent'
import { generateDataGridColumns } from '@openfaith/ui/table/dataGridColumnGenerator'
import {
  createDataGridActionsColumn,
  generateDataGridRelationColumns,
} from '@openfaith/ui/table/dataGridRelationColumnGenerator'
import { generateFilterConfig } from '@openfaith/ui/table/filterGenerator'
import { getRelatedEntityIds } from '@openfaith/ui/table/relationColumnGenerator'
import { getBaseEntityRelationshipsQuery } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import { Array, Option, pipe, type Schema, String } from 'effect'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo } from 'react'

export interface UniversalDataGridProps<T> {
  schema: Schema.Schema<T>
  onRowClick?: (row: T) => void
  onEditRow?: (row: T) => void
  onRowsSelected?: (rows: Array<T>) => void
  onCellEdit?: (row: T, field: string, newValue: any) => void
  showRowNumbers?: boolean
  Actions?: ReactNode
  showRelations?: boolean
  editable?: boolean
  filtering?: {
    filterPlaceHolder?: string
    filterColumnId?: string
    filterKey?: string
  }
  enableVirtualScrolling?: boolean // Enable virtual scrolling for pagination
}

export const UniversalDataGrid = <T extends Record<string, any>>(
  props: UniversalDataGridProps<T>,
): ReactNode => {
  const {
    schema,
    onRowClick,
    // onEditRow: providedOnEditRow,
    onRowsSelected,
    onCellEdit,
    showRowNumbers = true,
    Actions,
    showRelations = true,
    editable = true,
    filtering = {},
    enableVirtualScrolling = true,
  } = props

  // Use auto edit handler if none provided
  // For now, we don't use edit functionality in the Glide table
  // const { onEditRow: autoOnEditRow } = useUniversalTableEdit(schema)
  // const onEditRow = providedOnEditRow || autoOnEditRow

  const entityInfo = useMemo(() => {
    return extractEntityInfo(schema)
  }, [schema])

  const { collection, nextPage, loading, pageSize } = useSchemaCollection({ schema })

  // Use the schema update hook for mutations
  const { mutate: updateEntity } = useSchemaUpdate(schema, {
    onError: (error) => {
      console.error('Failed to update cell:', error)
    },
  })

  // Use the entity names fetcher hook for managing entity name lookups
  const { fetchEntityNames, getEntityNames, clearFetchedCache } = useEntityNamesFetcher()

  // Fetch entity relationships for this entity type
  const z = useZero()

  // Clear fetched cache when collection changes
  useEffect(() => {
    clearFetchedCache()
  }, [clearFetchedCache])

  const [allRelationships] = useQuery(getBaseEntityRelationshipsQuery(z), {
    enabled: showRelations && pipe(entityInfo.entityName, Option.fromNullable, Option.isSome),
  })

  // Transform relationships into a format for relation columns
  const transformedRelationships = useMemo(() => {
    if (!allRelationships || !Array.isArray(allRelationships) || !entityInfo.entityName) {
      return []
    }

    const db = pipe(
      allRelationships,
      Array.map((r) => ({
        sourceEntityType: r.sourceEntityType as string,
        targetEntityTypes: (r.targetEntityTypes || []) as ReadonlyArray<string>,
      })),
    )

    return buildEntityRelationshipsForTable(schema, db)
  }, [allRelationships, entityInfo.entityName, schema])

  // Generate columns from schema using the helper
  const { columns: baseColumns, columnIdToField } = useMemo(
    () => generateDataGridColumns(schema),
    [schema],
  )

  // Add relation columns if enabled
  const relationColumns = useMemo(() => {
    if (!showRelations || transformedRelationships.length === 0 || !entityInfo.entityName) {
      return []
    }

    return generateDataGridRelationColumns(transformedRelationships as Array<any>)
  }, [showRelations, transformedRelationships, entityInfo.entityName])

  // Add actions column
  const actionsColumn = createDataGridActionsColumn()

  // Combine all columns
  const columns = useMemo(() => {
    return pipe(baseColumns, Array.appendAll(relationColumns), Array.append(actionsColumn))
  }, [baseColumns, relationColumns, actionsColumn])

  // Get cell content callback
  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell
      const dataRow = collection[row]

      if (!dataRow) {
        return {
          allowOverlay: false,
          data: '',
          displayData: '',
          kind: GridCellKind.Text,
        }
      }

      const column = columns[col]
      if (!column || !column.id) {
        return {
          allowOverlay: false,
          data: '',
          displayData: '',
          kind: GridCellKind.Text,
        }
      }

      // Handle actions column
      if (column.id === 'actions') {
        return getActionsCell()
      }

      // Handle relation columns
      if (pipe(column.id, String.startsWith('relation_'))) {
        // Extract the target entity type from the column id
        const targetEntityType = pipe(column.id, String.replace('relation_', ''))

        // Get edges from the data row
        const entityId = (dataRow as any).id as string
        const sourceEdges = ((dataRow as any).sourceEdges || []) as Array<Edge>
        const targetEdges = ((dataRow as any).targetEdges || []) as Array<Edge>

        // Get related entity IDs using the helper function
        const relatedIds = getRelatedEntityIds(entityId, targetEntityType, sourceEdges, targetEdges)

        // Fetch entity names if we don't have them yet
        if (relatedIds.length > 0) {
          fetchEntityNames(targetEntityType, relatedIds)
        }

        // Get cached names for this entity type
        const entityNames = getEntityNames(targetEntityType)

        // Return cell with badges for related entities
        return getRelationCell(relatedIds, entityNames) // Show all badges with names
      }

      // Get the field using the column id
      const field = columnIdToField.get(column.id)
      if (!field) {
        return {
          allowOverlay: false,
          data: '',
          displayData: '',
          kind: GridCellKind.Text,
        }
      }

      const value = dataRow[field.key as keyof T]
      return getGridCellContent(field, value, editable)
    },
    [collection, columns, columnIdToField, editable, fetchEntityNames, getEntityNames],
  )

  // Handle cell edit
  const handleCellEdited = useCallback(
    (cell: Item, newValue: GridCell) => {
      const [col, row] = cell
      const dataRow = collection[row]

      if (!dataRow) {
        return
      }

      const column = columns[col]
      if (!column || !column.id) {
        return
      }

      // Skip non-data columns
      if (column.id === 'actions' || pipe(column.id, String.startsWith('relation_'))) {
        return
      }

      // Get the field using the column id
      const field = columnIdToField.get(column.id)
      if (!field) {
        return
      }

      // Extract the new value based on cell type
      let extractedValue: any
      switch (newValue.kind) {
        case GridCellKind.Text:
          extractedValue = (newValue as any).data
          break
        case GridCellKind.Uri:
          extractedValue = (newValue as any).data
          break
        case GridCellKind.Number:
          extractedValue = (newValue as any).data
          break
        case GridCellKind.Boolean:
          extractedValue = (newValue as any).data
          break
        case GridCellKind.Loading:
          // Loading cells don't have data
          return
        default:
          extractedValue = (newValue as any).data || ''
      }

      // Get the ID from the row - assuming it has an id field
      const rowId = (dataRow as any).id
      if (!rowId) {
        console.error('Row does not have an id field for update')
        return
      }

      // Use the Zero mutation to update the entity with the new field value
      const updatedData = {
        [field.key]: extractedValue,
        id: rowId,
      }
      updateEntity(updatedData as any)

      // Also call the custom callback if provided
      if (onCellEdit) {
        onCellEdit(dataRow, field.key, extractedValue)
      }
    },
    [collection, columns, columnIdToField, updateEntity, onCellEdit],
  )

  // Handle row click with actions column special handling
  const handleRowClick = useCallback(
    (row: T) => {
      // For now, just call the provided onRowClick
      // In the future, we could show a dropdown menu for the actions column
      if (onRowClick) {
        onRowClick(row)
      }
    },
    [onRowClick],
  )

  const entityName = entityInfo.entityName || 'items'
  const filterPlaceHolder = filtering.filterPlaceHolder || `Search ${entityName}...`

  // Generate filter configuration from schema
  const filtersDef = useMemo(() => {
    return generateFilterConfig(schema)
  }, [schema])

  // Render actions for the toolbar
  const ToolbarActions = Actions || (
    <Button
      onClick={() => {
        // Handle add new item
      }}
      size='sm'
    >
      Add {entityName}
    </Button>
  )

  // Detect if we're likely on the last page of data
  const isLikelyLastPage = collection.length > 0 && collection.length % pageSize !== 0

  const handleVisibleRegionChanged = useCallback(
    (range: Rectangle) => {
      // Rectangle has x, y, width, height
      // y is the row index, height is the number of visible rows
      const visibleEndRow = range.y + range.height

      // Check if we're near the bottom
      // Use a larger threshold (25% of pageSize) to trigger loading earlier
      const threshold = Math.max(5, Math.floor(pageSize * 0.25))
      const nearBottom = visibleEndRow >= collection.length - threshold

      // Trigger loading more data if we're near the bottom and not already loading
      // Also check that we have a full page of data (to avoid triggering on initial load)
      if (nearBottom && !loading && collection.length >= pageSize && !isLikelyLastPage) {
        nextPage()
      }
    },
    [collection.length, nextPage, loading, pageSize, isLikelyLastPage],
  )

  // Calculate virtual row count for scrolling
  // We add a buffer beyond loaded data to trigger pagination, but not too much to avoid flashing
  // If the last fetch returned less than pageSize items, we're likely at the end
  const virtualRowCount = useMemo(() => {
    if (!enableVirtualScrolling) {
      return collection.length
    }
    // If we're likely on the last page, don't extend beyond current data
    if (isLikelyLastPage) {
      return collection.length
    }
    // Otherwise, add a small buffer to trigger pagination
    // This prevents showing loading cells for items that don't exist yet
    return collection.length + pageSize
  }, [enableVirtualScrolling, collection.length, pageSize, isLikelyLastPage])

  return (
    <CollectionDataGrid
      _tag={entityInfo.entityTag || 'default'}
      Actions={ToolbarActions}
      columns={columns}
      data={collection}
      enableVirtualScrolling={enableVirtualScrolling}
      filterColumnId={filtering.filterColumnId || 'name'}
      filterKey={filtering.filterKey || `${entityName}-filter`}
      filterPlaceHolder={filterPlaceHolder}
      filtersDef={filtersDef}
      getCellContent={getCellContent}
      onCellEdited={editable ? handleCellEdited : undefined}
      onRowClick={handleRowClick}
      onRowsSelected={onRowsSelected}
      onVisibleRegionChanged={handleVisibleRegionChanged}
      showRowNumbers={showRowNumbers}
      totalRows={virtualRowCount}
    />
  )
}
