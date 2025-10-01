import * as OfSchemas from '@openfaith/schema'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { pluralize } from '@openfaith/shared'
import { Array, Option, Order, pipe, Record, Schema, SchemaAST, String } from 'effect'

// Dynamic union type that includes all schemas with _tag field that represent business entities
// This mirrors the logic in discoverEntitySchemas() but at the type level
export type EntityUnion = {
  [K in keyof typeof OfSchemas]: (typeof OfSchemas)[K] extends Schema.Schema<infer A, any, any>
    ? A extends { _tag: string; id: string; orgId: string }
      ? IsBusinessEntity<A> extends true
        ? A
        : never
      : never
    : never
}[keyof typeof OfSchemas]

// Helper type to determine if a type is a business entity (not a system entity)
// This excludes system entities like Edge, ExternalLink, Field types, etc.
type IsBusinessEntity<T> = T extends { _tag: infer Tag }
  ? Tag extends 'edge' | 'externalLink' | 'field' | 'fieldOption' | 'adapterWebhook'
    ? false
    : true
  : false

// Runtime utility to get all entity schemas that have both _tag and OfTable (final entity classes)
export const discoverEntitySchemas = () => {
  return pipe(
    OfSchemas,
    Record.toEntries,
    Array.filterMap(([name, schema]) => {
      if (!Schema.isSchema(schema)) {
        return Option.none()
      }

      const schemaObj = schema as Schema.Schema<any, any, never>

      // Check if it has a _tag field
      const tagOpt = extractEntityTagOpt(schemaObj)
      if (Option.isNone(tagOpt)) {
        return Option.none()
      }

      // Check if it has OfTable annotation (indicates it's a final entity class)
      const hasTableAnnotation = pipe(
        getAnnotationFromSchema(OfTable, schemaObj.ast),
        Option.isSome,
      )

      if (!hasTableAnnotation) {
        return Option.none()
      }

      return Option.some({
        name,
        schema: schemaObj,
        tag: tagOpt.value,
      })
    }),
  )
}

// Helper function to get annotations from schema, handling class-based schemas
const getAnnotationFromSchema = <A>(annotationId: symbol, ast: SchemaAST.AST): Option.Option<A> => {
  // First try direct annotation
  const directOpt = SchemaAST.getAnnotation<A>(annotationId)(ast)
  if (Option.isSome(directOpt)) {
    return directOpt
  }

  // If not found and this is a Transformation, check the Surrogate
  if (ast._tag === 'Transformation') {
    const surrogateOpt = SchemaAST.getAnnotation<SchemaAST.AST>(SchemaAST.SurrogateAnnotationId)(
      ast,
    )
    if (Option.isSome(surrogateOpt)) {
      return SchemaAST.getAnnotation<A>(annotationId)(surrogateOpt.value)
    }
  }

  return Option.none()
}

/**
 * Get schema for an entity type by tag (case-insensitive)
 * This function can be used on both frontend and backend
 */
export const getSchemaByEntityType = (
  entityType: string,
): Option.Option<Schema.Schema<any, any, never>> => {
  const entities = discoverEntitySchemas()

  return pipe(
    entities,
    Array.findFirst(
      (entity) => pipe(entity.tag, String.toLowerCase) === pipe(entityType, String.toLowerCase),
    ),
    Option.map((entity) => entity.schema),
  )
}

export interface EntityUiConfig {
  schema: Schema.Schema<any, any, never>
  tag: string
  navConfig: NonNullable<FieldConfig['navigation']>
  navItem: {
    iconName?: string
    title: string
    url: string
  }
  meta: {
    disableCreate: boolean
    disableDelete: boolean
    disableEdit: boolean
  }
}

export const discoverUiEntities = (): Array<EntityUiConfig> => {
  // Start with all entity schemas (those with _tag + OfTable)
  const entitySchemas = discoverEntitySchemas()

  return pipe(
    entitySchemas,
    Array.filterMap((entitySchema) => {
      const uiConfigOpt = getAnnotationFromSchema<FieldConfig>(OfUiConfig, entitySchema.schema.ast)
      const navConfigOpt = pipe(
        uiConfigOpt,
        Option.flatMap((config) => Option.fromNullable(config.navigation)),
        Option.filter((navConfig) => navConfig.enabled),
      )

      const meta = pipe(
        uiConfigOpt,
        Option.flatMap((config) => Option.fromNullable(config.meta)),
        Option.getOrElse(() => ({
          disableCreate: false,
          disableDelete: false,
          disableEdit: false,
        })),
        (x) => ({
          disableCreate: x.disableCreate || false,
          disableDelete: x.disableDelete || false,
          disableEdit: x.disableEdit || false,
        }),
      )

      if (Option.isNone(navConfigOpt)) {
        return Option.none()
      }

      const navConfig = navConfigOpt.value

      const navItem = {
        iconName: navConfig.icon,
        title: navConfig.title,
        url:
          navConfig.url ||
          `/${navConfig.module}/${pluralize(pipe(entitySchema.tag, String.toLowerCase))}`,
      }

      return Option.some({
        meta,
        navConfig,
        navItem,
        schema: entitySchema.schema,
        tag: entitySchema.tag,
      })
    }),
    Array.sort(Order.mapInput(Order.number, (item: EntityUiConfig) => item.navConfig.order ?? 999)),
  )
}

const extractEntityTagOpt = (schema: { ast: SchemaAST.AST }): Option.Option<string> => {
  const extractFromTypeLiteral = (ast: SchemaAST.AST): Option.Option<string> => {
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

  // First try the direct AST
  const directResult = extractFromTypeLiteral(schema.ast)
  if (Option.isSome(directResult)) {
    return directResult
  }

  // If this is a Transformation (class-based schema), check the 'from' AST
  if (schema.ast._tag === 'Transformation') {
    return extractFromTypeLiteral(schema.ast.from)
  }

  return Option.none()
}
