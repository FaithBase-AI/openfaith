import * as OfSchemas from '@openfaith/schema'
import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { pluralize } from '@openfaith/shared'
import { Array, Option, Order, pipe, Record, Schema, SchemaAST, String } from 'effect'

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

export interface EntityUiConfig {
  schema: Schema.Schema<any, any, never>
  tag: string
  navConfig: NonNullable<FieldConfig['navigation']>
  navItem: {
    iconName?: string
    title: string
    url: string
  }
}

export const discoverUiEntities = (): Array<EntityUiConfig> => {
  return pipe(
    OfSchemas,
    Record.toEntries,
    Array.filterMap(([, schema]) => {
      if (!Schema.isSchema(schema)) {
        return Option.none()
      }

      const schemaObj = schema

      const uiConfigOpt = getAnnotationFromSchema<FieldConfig>(OfUiConfig, schemaObj.ast)
      const navConfigOpt = pipe(
        uiConfigOpt,
        Option.flatMap((config) => Option.fromNullable(config.navigation)),
        Option.filter((navConfig) => navConfig.enabled),
      )

      if (Option.isNone(navConfigOpt)) {
        return Option.none()
      }

      const navConfig = navConfigOpt.value

      const tagOpt = extractEntityTagOpt(schemaObj)
      if (Option.isNone(tagOpt)) {
        return Option.none()
      }

      const tag = tagOpt.value

      const navItem = {
        iconName: navConfig.icon,
        title: navConfig.title,
        url: navConfig.url || `/${navConfig.module}/${pluralize(pipe(tag, String.toLowerCase))}`,
      }

      return Option.some({
        navConfig,
        navItem,
        schema: schemaObj as Schema.Schema<any, any, never>,
        tag,
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
