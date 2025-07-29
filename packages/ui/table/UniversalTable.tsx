import { nullOp } from '@openfaith/shared'
import { Collection } from '@openfaith/ui/components/collections/collection'
import type { CollectionTags } from '@openfaith/ui/components/collections/collectionComponents'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, Option, pipe, type Schema, SchemaAST } from 'effect'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { generateColumns } from './columnGenerator'

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

export const UniversalTable = <T,>({
  schema,
  data,
  columnOverrides = {},
  // onRowClick,
  // onRowSelect,
  className,
  Actions,
  CollectionCard,
  pagination = { limit: 100, nextPage: nullOp, pageSize: 20 },
  filtering = {},
}: UniversalTableProps<T>) => {
  // Generate columns from schema
  const columns = useMemo(() => {
    return generateColumns(schema, columnOverrides)
  }, [schema, columnOverrides])

  // Generate filters from schema (placeholder for now)
  const filtersDef = useMemo(() => {
    // TODO: Generate filters from schema annotations
    return [] as const
  }, [])

  // Extract entity information from schema
  const entityInfo = useMemo(() => {
    return extractEntityInfo(schema)
  }, [schema])

  // Generate Collection props from UniversalTable props
  const collectionProps = useMemo(() => {
    const entityName = entityInfo.entityName || 'items'
    const collectionTag = entityInfo.collectionTag || 'default'

    return {
      _tag: collectionTag as CollectionTags,
      Actions: Actions || null,
      CollectionCard,
      className,
      columnsDef: columns,
      data,
      filterColumnId: filtering.filterColumnId || 'name',
      filterKey: filtering.filterKey || `${entityName}-filter`,
      filterPlaceHolder: filtering.filterPlaceHolder || `Search ${entityName}...`,
      filtersDef,
      filtersOptions: undefined,
      limit: pagination.limit || 100,
      nextPage: pagination.nextPage || nullOp,
      pageSize: pagination.pageSize || 20,
      rowSize: undefined,
    }
  }, [
    entityInfo,
    columns,
    data,
    filtering,
    pagination,
    Actions,
    CollectionCard,
    filtersDef,
    className,
  ])

  return <Collection {...collectionProps} />
}

// Helper function to extract entity information from schema
const extractEntityInfo = <T,>(schema: Schema.Schema<T>) => {
  const ast = schema.ast

  // Extract entity tag from _tag field if it exists
  const entityTag = extractEntityTag(ast)

  // Generate entity name and collection tag
  const entityName = pipe(
    entityTag,
    Option.match({
      onNone: () => 'item',
      onSome: (tag) => tag,
    }),
  )

  const collectionTag = pipe(
    entityTag,
    Option.match({
      onNone: () => 'default',
      onSome: (tag) => {
        // Map entity tags to collection tags
        switch (tag) {
          case 'person':
            return 'users' // Map people to users collection tag
          case 'folder':
            return 'default'
          case 'org':
            return 'orgs'
          default:
            return 'default'
        }
      },
    }),
  )

  return {
    collectionTag,
    entityName,
    entityTag: Option.getOrUndefined(entityTag),
  }
}

// Helper function to extract entity tag from schema AST
const extractEntityTag = (ast: SchemaAST.AST): Option.Option<string> => {
  if (SchemaAST.isTypeLiteral(ast)) {
    const propertySignatures = ast.propertySignatures
    const tagProperty = pipe(
      propertySignatures,
      Array.findFirst((prop) => prop.name === '_tag'),
    )

    if (Option.isSome(tagProperty)) {
      const tagAST = tagProperty.value.type
      if (SchemaAST.isLiteral(tagAST) && typeof tagAST.literal === 'string') {
        return Option.some(tagAST.literal)
      }
    }
  }

  return Option.none()
}
