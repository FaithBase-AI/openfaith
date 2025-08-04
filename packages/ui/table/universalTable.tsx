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
import { useSchemaCollection } from '@openfaith/ui/shared/hooks/schemaHooks'
import { generateColumns } from '@openfaith/ui/table/columnGenerator'
import { generateFilterConfig } from '@openfaith/ui/table/filterGenerator'
import { useUniversalTableEdit } from '@openfaith/ui/table/useUniversalTableEdit'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, pipe, type Schema } from 'effect'
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
  } = props

  const { onEditRow: autoOnEditRow } = useUniversalTableEdit(schema)
  const onEditRow = providedOnEditRow || autoOnEditRow

  const entityInfo = useMemo(() => {
    return extractEntityInfo(schema)
  }, [schema])

  const { collection, nextPage, pageSize, limit } = useSchemaCollection({ schema })

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
