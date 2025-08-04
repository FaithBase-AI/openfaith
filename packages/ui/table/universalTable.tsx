import { extractEntityInfo, useSchemaCollection } from '@openfaith/schema'
import { nullOp } from '@openfaith/shared'
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
import { generateColumns } from '@openfaith/ui/table/columnGenerator'
import { generateFilterConfig } from '@openfaith/ui/table/filterGenerator'
import { useUniversalTableEdit } from '@openfaith/ui/table/useUniversalTableEdit'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, pipe, type Schema } from 'effect'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

export interface UniversalTableProps<T> {
  schema: Schema.Schema<T>
  data?: Array<T> // Optional - if not provided, will fetch from Zero
  columnOverrides?: Partial<Record<keyof T, Partial<ColumnDef<T>>>>
  onRowClick?: (row: T) => void
  onRowSelect?: (rows: Array<T>) => void
  onEditRow?: (row: T) => void
  className?: string
  Actions?: ReactNode
  CollectionCard?: any // CollectionCardComponent type
  pagination?: {
    pageSize?: number
    limit?: number
    nextPage?: () => void
  }
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
    data,
    columnOverrides = {},
    // onRowClick,
    // onRowSelect,
    onEditRow: providedOnEditRow,
    Actions,
    CollectionCard,
    pagination = { limit: 100, nextPage: nullOp, pageSize: 20 },
    filtering = {},
  } = props

  const { onEditRow: autoOnEditRow } = useUniversalTableEdit(schema)
  const onEditRow = providedOnEditRow || autoOnEditRow

  const entityInfo = useMemo(() => {
    return extractEntityInfo(schema)
  }, [schema])

  const collectionResult = useSchemaCollection(schema, {
    enabled: !data,
    limit: pagination.limit,
    pageSize: pagination.pageSize,
  })

  const columns = useMemo(() => {
    const baseColumns = generateColumns(schema, columnOverrides)

    const actionsColumn: ColumnDef<T> = {
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={'ml-auto'} size={'icon-xs'} variant={'secondary'}>
              <MoreVerticalIcon className={'size-4'} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'end'} side={'bottom'}>
            {onEditRow && (
              <DropdownMenuItem
                onClick={() => {
                  onEditRow(row.original)
                }}
              >
                <EditIcon className={'mr-2 size-4'} />
                <p className={'mr-auto mb-auto ml-0'}>Edit</p>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
      enableSorting: false,
      header: () => null,
      id: 'actions',
      size: 56,
    }

    return pipe(baseColumns, Array.append(actionsColumn))
  }, [schema, columnOverrides, onEditRow])

  const filtersDef = useMemo(() => {
    return generateFilterConfig(schema)
  }, [schema])

  const entityName = entityInfo.entityName || 'items'

  const finalData = data || collectionResult.data
  const finalNextPage = pagination.nextPage || collectionResult.nextPage

  return (
    <Collection
      _tag={entityInfo.entityTag || 'default'}
      Actions={Actions || null}
      CollectionCard={CollectionCard}
      columnsDef={columns}
      data={finalData}
      filterColumnId={filtering.filterColumnId || 'name'}
      filterKey={filtering.filterKey || `${entityName}-filter`}
      filterPlaceHolder={filtering.filterPlaceHolder || `Search ${entityName}...`}
      filtersDef={filtersDef}
      filtersOptions={undefined}
      limit={pagination.limit || collectionResult.limit}
      nextPage={finalNextPage}
      pageSize={pagination.pageSize || collectionResult.pageSize}
      rowSize={undefined}
    />
  )
}
