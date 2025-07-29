import { OfEntity } from '@openfaith/schema/shared/schema'
import { nullOp } from '@openfaith/shared'
import { Collection } from '@openfaith/ui/components/collections/collection'
import type { ColumnDef } from '@tanstack/react-table'
import { Option, pipe, type Schema, SchemaAST } from 'effect'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { generateColumns } from './columnGenerator'
import { useSchemaCollection } from './useSchemaCollection'

export interface UniversalTableProps<T> {
  schema: Schema.Schema<T>
  data?: Array<T> // Optional - if not provided, will fetch from Zero
  columnOverrides?: Partial<Record<keyof T, Partial<ColumnDef<T>>>>
  onRowClick?: (row: T) => void
  onRowSelect?: (rows: Array<T>) => void
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
    Actions,
    CollectionCard,
    pagination = { limit: 100, nextPage: nullOp, pageSize: 20 },
    filtering = {},
  } = props

  // Use schema collection hook to fetch data if no data prop is provided
  const collectionResult = useSchemaCollection(schema, {
    enabled: !data,
    limit: pagination.limit,
    pageSize: pagination.pageSize, // Only fetch if no data is provided
  })

  const columns = useMemo(() => {
    return generateColumns(schema, columnOverrides)
  }, [schema, columnOverrides])

  const filtersDef = useMemo(() => {
    return [] as const
  }, [])

  const entityInfo = useMemo(() => {
    return extractEntityInfo(schema)
  }, [schema])

  const entityName = entityInfo.entityName || 'items'

  // Use provided data or fetched data from collection
  const finalData = data || collectionResult.data
  const finalNextPage = pagination.nextPage || collectionResult.nextPage

  return (
    <Collection
      _tag='default'
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
