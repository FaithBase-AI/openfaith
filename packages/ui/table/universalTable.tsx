import { extractEntityInfo } from '@openfaith/schema'
import { Collection } from '@openfaith/ui/components/collections/collection'
import { Button } from '@openfaith/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@openfaith/ui/components/ui/dropdown-menu'
import { EditIcon } from '@openfaith/ui/icons/editIcon'
import { MoreVerticalIcon } from '@openfaith/ui/icons/moreVerticalIcon'
import {
  buildEntityRelationshipsForTable,
  useSchemaCollection,
} from '@openfaith/ui/shared/hooks/schemaHooks'
import { generateColumns } from '@openfaith/ui/table/columnGenerator'
import { generateFilterConfig } from '@openfaith/ui/table/filterGenerator'
import { generateRelationColumns } from '@openfaith/ui/table/relationColumnGenerator'
import { useUniversalTableEdit } from '@openfaith/ui/table/useUniversalTableEdit'
import { getBaseEntityRelationshipsQuery } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, pipe, type Schema, String } from 'effect'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

export interface UniversalTableProps<T> {
  schema: Schema.Schema<T>
  columnOverrides?: Partial<Record<keyof T, Partial<ColumnDef<T>>>>
  onRowClick?: (row: T) => void
  onRowSelect?: (rows: Array<T>) => void
  onEditRow?: (row: T) => void
  className?: string
  Actions?: ReactNode
  CollectionCard?: any // CollectionCardComponent type
  showRelations?: boolean // Show relation columns (default: true)

  filtering?: {
    filterColumnId?: string
    filterPlaceHolder?: string
    filterKey?: string
  }
  loading?: boolean // Optional loading state override
}

export const UniversalTable = <T,>(props: UniversalTableProps<T>) => {
  const {
    schema,
    columnOverrides = {},
    // onRowClick,
    // onRowSelect,
    onEditRow: providedOnEditRow,
    Actions,
    CollectionCard,
    filtering = {},
    showRelations = true,
  } = props

  const { onEditRow: autoOnEditRow } = useUniversalTableEdit(schema)
  const onEditRow = providedOnEditRow || autoOnEditRow

  const entityInfo = useMemo(() => {
    return extractEntityInfo(schema)
  }, [schema])

  const { collection, nextPage, pageSize, limit } = useSchemaCollection({
    schema,
  })

  // Fetch entity relationships for this entity type
  const z = useZero()
  const entityRelationshipsQuery = useMemo(() => {
    if (!showRelations || !entityInfo.entityName) {
      return null
    }

    return getBaseEntityRelationshipsQuery(z)
  }, [z, entityInfo.entityName, showRelations])

  const [allRelationships] = useQuery(entityRelationshipsQuery as Parameters<typeof useQuery>[0])

  // Transform relationships into a format for generateRelationColumns
  const transformedRelationships = useMemo(() => {
    if (!allRelationships || !Array.isArray(allRelationships) || !entityInfo.entityName) {
      return []
    }

    const db = pipe(
      allRelationships as Array<any>,
      Array.map((r) => ({
        sourceEntityType: r.sourceEntityType as string,
        targetEntityTypes: (r.targetEntityTypes || []) as ReadonlyArray<string>,
      })),
    )

    return buildEntityRelationshipsForTable(schema, db)
  }, [allRelationships, entityInfo.entityName, schema])

  const columns = useMemo(() => {
    const baseColumns = generateColumns(schema, columnOverrides)

    // Generate relation columns if enabled and we have relationships
    const shouldGenerateRelations =
      showRelations && transformedRelationships.length > 0 && entityInfo.entityName

    const relationColumns = shouldGenerateRelations
      ? generateRelationColumns(
          pipe(entityInfo.entityName, String.toLowerCase),
          transformedRelationships,
          3, // maxVisibleBadges
        )
      : []

    const actionsColumn: ColumnDef<T> = {
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={'ml-auto'} size={'icon-xs'} variant={'secondary'}>
              <MoreVerticalIcon className={'size-4'} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'end'} side={'bottom'}>
            <DropdownMenuItem
              onClick={() => {
                onEditRow(row.original)
              }}
            >
              <EditIcon className={'mr-2 size-4'} />
              <p className={'mr-auto mb-auto ml-0'}>Edit</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
      enableSorting: false,
      header: () => null,
      id: 'actions',
      size: 56,
    }

    // Merge base columns with relation columns, then add actions
    return pipe(
      baseColumns,
      Array.appendAll(relationColumns as Array<ColumnDef<T>>),
      Array.append(actionsColumn),
    )
  }, [
    schema,
    columnOverrides,
    onEditRow,
    showRelations,
    transformedRelationships,
    entityInfo.entityName,
  ])

  const filtersDef = useMemo(() => {
    return generateFilterConfig(schema)
  }, [schema])

  const entityName = entityInfo.entityName || 'items'

  return (
    <Collection
      _tag={entityInfo.entityTag || 'default'}
      Actions={Actions || null}
      CollectionCard={CollectionCard}
      columnsDef={columns}
      data={collection}
      filterColumnId={filtering.filterColumnId || 'name'}
      filterKey={filtering.filterKey || `${entityName}-filter`}
      filterPlaceHolder={filtering.filterPlaceHolder || `Search ${entityName}...`}
      filtersDef={filtersDef}
      limit={limit}
      nextPage={nextPage}
      pageSize={pageSize}
    />
  )
}
