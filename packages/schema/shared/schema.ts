import { Array, Option, pipe, SchemaAST } from 'effect'

export const OfFieldName = Symbol.for('@openfaith/schema/fieldName')
export const OfCustomField = Symbol.for('@openfaith/schema/customField')
export const OfSkipField = Symbol.for('@openfaith/schema/skipField')
export const OfEntity = Symbol.for('@openfaith/schema/entity')
export const OfEdge = Symbol.for('@openfaith/schema/edge')
export const OfFolder = Symbol.for('@openfaith/schema/folder')
export const OfSkipEntity = Symbol.for('@openfaith/schema/skipEntity')
export const OfTransformer = Symbol.for('@openfaith/schema/transformer')
export const OfPartialTransformer = Symbol.for('@openfaith/schema/partialTransformer')
export const OfDefaultValueFn = Symbol.for('@openfaith/schema/defaultValueFn')

// Predicate to filter out entities that have data we don't want to sync.
export const OfFilterFn = Symbol.for('@openfaith/schema/filterFn')
export const OfFolderType = Symbol.for('@openfaith/schema/folderType')
export const OfTable = Symbol.for('@openfaith/schema/table')
export const OfUiConfig = Symbol.for('@openfaith/schema/uiConfig')
export const OfRelations = Symbol.for('@openfaith/schema/relations')
export const OfForeignKey = Symbol.for('@openfaith/schema/foreignKey')

export type OfEdgeAnnotation = {
  relationshipType: string
  targetEntityTypeTag: string
}

export type OfFolderAnnotation = {
  folderType: string
}

export interface FieldConfig {
  field?: {
    type?:
      | 'text'
      | 'email'
      | 'password'
      | 'slug'
      | 'textarea'
      | 'number'
      | 'select'
      | 'combobox'
      | 'singleCombobox'
      | 'switch'
      | 'date'
      | 'datetime'
      | 'tags'
      | 'otp'
      | 'addressLocation'
    label?: string
    placeholder?: string
    required?: boolean
    hidden?: boolean
    options?: Array<{ value: string; label: string }>
    rows?: number
    searchable?: boolean
    creatable?: boolean
    multiple?: boolean
    min?: number | string
    max?: number | string
    step?: number
    order?: number
    composite?: Array<string>
  }
  table?: {
    header?: string
    width?: number
    sortable?: boolean
    filterable?: boolean
    cellType?:
      | 'text'
      | 'email'
      | 'number'
      | 'boolean'
      | 'date'
      | 'datetime'
      | 'currency'
      | 'badge'
      | 'avatar'
      | 'link'
      | 'entityLink'
    hidden?: boolean
    pinned?: 'left' | 'right'
    order?: number
    readonly?: boolean
  }
  navigation?: {
    enabled: boolean
    title: string
    icon?: string
    url?: string
    module:
      | 'directory'
      | 'domain'
      | 'collection'
      | 'schedule'
      | 'giving'
      | 'management'
      | 'drive'
      | 'system'
      | 'external'
    order?: number
    description?: string
  }

  meta?: {
    disableCreate?: boolean
    disableEdit?: boolean
    disableDelete?: boolean
  }
}

export type RelationDirection = 'outbound' | 'inbound' | 'both'

export type RelationUiTable = {
  show?: boolean
  order?: number
  header?: string
  pinned?: 'left' | 'right'
  maxVisibleBadges?: number
}

export type RelationUiForm = {
  show?: boolean
  order?: number
  input: 'singleCombobox' | 'combobox'
  label?: string
  required?: boolean
}

export type RelationConfig = {
  key: string
  targetEntityTag: string
  direction?: RelationDirection
  label?: string
  table?: RelationUiTable
  form?: RelationUiForm
}

declare module 'effect/Schema' {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [OfFieldName]?: string
      [OfCustomField]?: boolean
      [OfSkipField]?: boolean
      [OfEntity]?: Schema.Any
      [OfEdge]?: OfEdgeAnnotation
      [OfFolder]?: OfFolderAnnotation
      [OfSkipEntity]?: boolean
      [OfTransformer]?: unknown
      [OfFolderType]?: string
      [OfTable]?: unknown
      [OfUiConfig]?: FieldConfig
      [OfRelations]?: ReadonlyArray<RelationConfig>
      [OfForeignKey]?: {
        targetEntityTag: string
      }
      [OfFilterFn]?: (entity: A) => boolean
      [OfDefaultValueFn]?: (entity: any) => unknown
    }

    interface Doc<A> extends SchemaAST.Annotations {
      [OfFieldName]?: string
      [OfCustomField]?: boolean
      [OfSkipField]?: boolean
      [OfEntity]?: Schema.Any
      [OfEdge]?: OfEdgeAnnotation
      [OfFolder]?: OfFolderAnnotation
      [OfSkipEntity]?: boolean
      [OfTransformer]?: unknown
      [OfFolderType]?: string
      [OfTable]?: unknown
      [OfUiConfig]?: FieldConfig
      [OfRelations]?: ReadonlyArray<RelationConfig>
      [OfForeignKey]?: {
        targetEntityTag: string
      }
      [OfFilterFn]?: (entity: A) => boolean
      [OfDefaultValueFn]?: (entity: any) => unknown
    }
  }
}

export const getUnderlyingType = (
  ast: SchemaAST.AST,
): 'string' | 'number' | 'boolean' | 'unknown' => {
  if (SchemaAST.isUnion(ast)) {
    const nonNullType = pipe(
      ast.types,
      Array.findFirst(
        (type) => type._tag !== 'Literal' || (type._tag === 'Literal' && type.literal !== null),
      ),
      Option.getOrUndefined,
    )

    if (nonNullType) {
      return getUnderlyingType(nonNullType)
    }
  }

  if (SchemaAST.isRefinement(ast)) {
    return getUnderlyingType(ast.from)
  }

  if (SchemaAST.isTransformation(ast)) {
    return getUnderlyingType(ast.from)
  }

  switch (ast._tag) {
    case 'StringKeyword':
      return 'string' as const
    case 'NumberKeyword':
      return 'number' as const
    case 'BooleanKeyword':
      return 'boolean' as const
    case 'Literal':
      if (typeof ast.literal === 'string') {
        return 'string' as const
      }
      if (typeof ast.literal === 'number') {
        return 'number' as const
      }
      if (typeof ast.literal === 'boolean') {
        return 'boolean' as const
      }
      return 'unknown' as const
    default:
      return 'unknown' as const
  }
}
