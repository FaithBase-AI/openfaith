import {
  type CustomFieldSchema,
  getUnderlyingType,
  mkCustomField,
  OfCustomField,
  OfDefaultValueFn,
  OfFieldName,
  OfSkipField,
} from '@openfaith/schema'
import { Array, Boolean, Option, pipe, Record, Schema, SchemaAST, String } from 'effect'

// Recursive function to find annotations in nested AST structures (for Schema.partial support)
const findAnnotationInAST = <T>(annotationKey: symbol, ast: SchemaAST.AST): Option.Option<T> => {
  // Check current level
  const directAnnotation = SchemaAST.getAnnotation<T>(annotationKey)(ast as SchemaAST.Annotated)
  if (directAnnotation._tag === 'Some') {
    return directAnnotation
  }

  // Check nested structures for Schema.partial() support
  if ((ast as any)._tag === 'Union' && (ast as any).types) {
    // Search in union types (Schema.partial creates unions with undefined)
    for (const unionType of (ast as any).types) {
      const foundInUnion = findAnnotationInAST<T>(annotationKey, unionType)
      if (foundInUnion._tag === 'Some') {
        return foundInUnion
      }
    }
  }

  if ((ast as any)._tag === 'Refinement' && (ast as any).from) {
    // Search in refinement 'from' type
    return findAnnotationInAST<T>(annotationKey, (ast as any).from)
  }

  return Option.none()
}

// Helper function to check if an AST represents a nullable type (NullOr)
const isNullableType = (ast: SchemaAST.AST): boolean => {
  // Check if it's a union type containing null
  if (ast._tag === 'Union') {
    const unionTypes = (ast as any).types || []
    for (const type of unionTypes) {
      if (type._tag === 'Literal' && (type as any).literal === null) {
        return true
      }
    }
    return false
  }

  // Check nested structures for transformed schemas
  if (ast._tag === 'Transformation') {
    const fromAst = (ast as any).from
    const toAst = (ast as any).to
    return isNullableType(fromAst) || isNullableType(toAst)
  }

  // Check refinements
  if (ast._tag === 'Refinement') {
    return isNullableType((ast as any).from)
  }

  return false
}

// Helper function to get the base type of an AST (Boolean, String, Number, etc.)
const getBaseType = (ast: SchemaAST.AST): string => {
  // Handle direct types
  if (ast._tag === 'BooleanKeyword') {
    return 'boolean'
  }
  if (ast._tag === 'StringKeyword') {
    return 'string'
  }
  if (ast._tag === 'NumberKeyword') {
    return 'number'
  }

  // Handle unions (like NullOr which creates String | null)
  if (ast._tag === 'Union') {
    const unionTypes = (ast as any).types || []
    for (const type of unionTypes) {
      // Skip null literals, find the actual type
      if (type._tag !== 'Literal' || (type as any).literal !== null) {
        const baseType = getBaseType(type)
        if (baseType !== 'unknown') {
          return baseType
        }
      }
    }
  }

  // Handle transformations
  if (ast._tag === 'Transformation') {
    const fromAst = (ast as any).from
    return getBaseType(fromAst)
  }

  // Handle refinements
  if (ast._tag === 'Refinement') {
    return getBaseType((ast as any).from)
  }

  return 'unknown'
}

// Helper function to get default value for a custom field based on its type
const getDefaultValueForCustomField = (ast: SchemaAST.AST, sourceObj?: unknown): unknown => {
  // Check if there's a custom default value function
  const defaultValueFnOpt = SchemaAST.getAnnotation<(obj: any) => unknown>(OfDefaultValueFn)(
    ast as SchemaAST.Annotated,
  )

  if (defaultValueFnOpt._tag === 'Some' && sourceObj !== undefined) {
    return defaultValueFnOpt.value(sourceObj)
  }

  const baseType = getBaseType(ast)
  const nullable = isNullableType(ast)

  // If nullable, default to null
  if (nullable) {
    return null
  }

  // For non-nullable types, provide appropriate defaults
  switch (baseType) {
    case 'boolean':
      return false
    case 'number':
      return 0
    case 'string':
      return ''
    default:
      return null
  }
}

type MergeShape = Record<string, unknown> & {
  customFields: Array<CustomFieldSchema>
}
type FieldShape<T> = readonly [string, T] | readonly ['customFields', CustomFieldSchema]

// Helper function to extract fields from any schema (including extended structs)
const extractFields = (schema: Schema.Schema.Any): Record<string, { ast: SchemaAST.AST }> => {
  const ast = schema.ast

  if (ast._tag === 'TypeLiteral') {
    return pipe(
      ast.propertySignatures,
      Array.map((prop) => {
        // For Schema.partial(), annotations may be nested in union types
        // Use recursive search to find them
        const ofFieldNameOpt = findAnnotationInAST<string>(OfFieldName, prop.type)
        const ofCustomFieldOpt = findAnnotationInAST<boolean>(OfCustomField, prop.type)
        const ofSkipFieldOpt = findAnnotationInAST<boolean>(OfSkipField, prop.type)

        // Create merged annotations with found values
        const mergedAnnotations = {
          ...(prop.type.annotations || {}),
          ...(prop.annotations || {}),
        }

        // Add found annotations
        if (ofFieldNameOpt._tag === 'Some') {
          mergedAnnotations[OfFieldName as any] = ofFieldNameOpt.value
        }
        if (ofCustomFieldOpt._tag === 'Some') {
          mergedAnnotations[OfCustomField as any] = ofCustomFieldOpt.value
        }
        if (ofSkipFieldOpt._tag === 'Some') {
          mergedAnnotations[OfSkipField as any] = ofSkipFieldOpt.value
        }

        const fieldAst = {
          ...prop.type,
          annotations: mergedAnnotations,
        } as SchemaAST.AST

        return [prop.name as string, { ast: fieldAst }] as const
      }),
      Record.fromEntries,
    )
  }

  if (ast._tag === 'Transformation' && ast.from._tag === 'TypeLiteral') {
    // For transformed schemas (like Schema.Struct with optionalWith fields),
    // annotations might be on the property signatures themselves
    const fields: Record<string, { ast: SchemaAST.AST }> = {}

    ast.from.propertySignatures.forEach((prop) => {
      const name = prop.name as string
      // Create an AST that includes annotations from both the property and its type
      const fieldAst = {
        ...prop.type,
        annotations: {
          ...(prop.type.annotations || {}),
          ...(prop.annotations || {}), // Property annotations override type annotations
        },
      } as SchemaAST.AST
      fields[name] = { ast: fieldAst }
    })

    // Also check if there are annotations in the 'to' side for optionalWith fields
    if (ast.to._tag === 'TypeLiteral') {
      ast.to.propertySignatures.forEach((toProp) => {
        const name = toProp.name as string
        if (name in fields && fields[name]) {
          // Merge annotations from the 'to' side
          fields[name].ast = {
            ...fields[name].ast,
            annotations: {
              ...(fields[name].ast?.annotations || {}),
              ...(toProp.annotations || {}),
            },
          } as SchemaAST.AST
        }
      })
    }

    return fields
  }

  // Fallback for Schema.Struct types
  if ('fields' in schema) {
    return (schema as any).fields
  }

  return {}
}

export const pcoToOf = <From extends Schema.Schema.Any, To extends Schema.Schema.Any>(
  from: From,
  to: To,
  tag: string,
) => {
  return Schema.transform(from, to, {
    decode: (fromItem) =>
      pipe(
        extractFields(from),
        Record.toEntries,
        Array.filterMap(([key, field]) => {
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OfFieldName)(
            field.ast as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OfCustomField)(
            field.ast as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))
          const skipField = SchemaAST.getAnnotation<boolean>(OfSkipField)(
            field.ast as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          // Try to get the default value function annotation first
          const defaultValueFnOpt = SchemaAST.getAnnotation<(obj: any) => unknown>(
            OfDefaultValueFn,
          )(field.ast as SchemaAST.Annotated)

          const type = getUnderlyingType(field.ast as SchemaAST.AST)

          // Skip fields with unknown type UNLESS they have a default value function
          if (skipField || (type === 'unknown' && defaultValueFnOpt._tag === 'None')) {
            return Option.none()
          }

          const value = pipe(
            key in (fromItem as any)
              ? Option.some((fromItem as any)[key])
              : pipe(
                  defaultValueFnOpt,
                  Option.map((fn) => fn(fromItem)),
                ),
          )

          return pipe(
            value,
            Option.flatMap((x) =>
              pipe(
                fieldKeyOpt,
                Option.map((y) =>
                  pipe(
                    customField,
                    Boolean.match<FieldShape<typeof x>>({
                      onFalse: () => [y, x],
                      onTrue: () => {
                        // For custom fields, infer type from value if underlying type is unknown
                        const effectiveType =
                          type === 'unknown'
                            ? typeof x === 'number'
                              ? 'number'
                              : typeof x === 'boolean'
                                ? 'boolean'
                                : 'string'
                            : type
                        return mkCustomField(
                          effectiveType,
                          `pco_${key}`,
                          x as string | number | boolean,
                          'pco',
                        )
                      },
                    }),
                  ),
                ),
              ),
            ),
          )
        }),
        Array.reduce({ customFields: [] } as MergeShape, (b, [key, value]) => {
          if (key === 'customFields') {
            return {
              ...b,
              customFields: [...b.customFields, value as CustomFieldSchema],
            }
          }

          return {
            ...b,
            [key]: value,
          }
        }),
        (merged) => {
          // Add default values for required fields that don't exist in PCO
          const result = {
            _tag: tag,
            ...merged,
          } as any

          // Add default tags if not present
          if (!('tags' in result)) {
            result.tags = []
          }

          // Add default type if not present
          if (!('type' in result)) {
            result.type = 'default'
          }

          if (!('status' in result)) {
            result.status = 'active'
          }

          // Transform gender format from PCO to OF format
          if (result.gender) {
            switch (result.gender) {
              case 'Male':
              case 'M':
                result.gender = 'male'
                break
              case 'Female':
              case 'F':
                result.gender = 'female'
                break
              default:
                result.gender = null
            }
          }

          return result
        },
      ),
    encode: (toItem) => {
      const { customFields = [], ...rest } = toItem as MergeShape
      // Ensure customFields is an array (it might be serialized as string)
      const customFieldsArray = Array.isArray(customFields)
        ? customFields
        : typeof customFields === 'string'
          ? JSON.parse(customFields)
          : []

      const standardFields = pipe(
        extractFields(from),
        Record.toEntries,
        Array.filterMap(([pcoKey, field]) => {
          const fieldAst = 'ast' in field ? field.ast : field
          const fieldKeyOpt = SchemaAST.getAnnotation<string>(OfFieldName)(
            fieldAst as SchemaAST.Annotated,
          )
          const customField = SchemaAST.getAnnotation<boolean>(OfCustomField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))
          const skipField = SchemaAST.getAnnotation<boolean>(OfSkipField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          // Skip custom fields as they're handled separately
          // Also skip fields marked with OFSkipField
          if (customField || skipField) {
            return Option.none()
          }

          return pipe(
            fieldKeyOpt,
            Option.flatMap((OfFieldName) => {
              // Check if field exists in OF data
              if (OfFieldName in (rest as any)) {
                return Option.some([pcoKey, (rest as any)[OfFieldName]] as const)
              }

              // Field doesn't exist - check if PCO schema accepts null
              // If the field is nullable, provide null instead of skipping
              if (isNullableType(fieldAst)) {
                return Option.some([pcoKey, null] as const)
              }

              return Option.none()
            }),
          )
        }),
        Array.reduce({}, (b, [key, value]) => {
          return {
            ...b,
            [key]: value,
          }
        }),
      )

      const customFieldsDecoded = pipe(
        customFieldsArray as Array<CustomFieldSchema>,
        Array.reduce({}, (b, customField) => {
          // Skip custom fields that are not from PCO
          if (customField.source !== 'pco') {
            return b
          }

          // Extract the original PCO field name by removing the 'pco_' prefix
          const pcoFieldName = pipe(customField.name, String.replace(/^pco_/, ''))
          return {
            ...b,
            [pcoFieldName]: customField.value,
          }
        }),
      )

      // Build intermediate result to pass to default value functions
      const intermediateResult = {
        ...standardFields,
        ...customFieldsDecoded,
      }

      // Handle missing custom fields - provide defaults for required custom fields
      const missingCustomFields = pipe(
        extractFields(from),
        Record.toEntries,
        Array.filterMap(([pcoKey, field]) => {
          const fieldAst = 'ast' in field ? field.ast : field
          const customField = SchemaAST.getAnnotation<boolean>(OfCustomField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))
          const skipField = SchemaAST.getAnnotation<boolean>(OfSkipField)(
            fieldAst as SchemaAST.Annotated,
          ).pipe(Option.getOrElse(() => false))

          // Only process custom fields that aren't skipped
          if (!customField || skipField) {
            return Option.none()
          }

          // Check if this custom field is already in the decoded data
          if (pcoKey in customFieldsDecoded) {
            return Option.none()
          }

          // Provide a default value for this missing custom field
          // Pass intermediateResult so the function can access other processed fields
          const defaultValue = getDefaultValueForCustomField(fieldAst, intermediateResult)
          return Option.some([pcoKey, defaultValue] as const)
        }),
        Array.reduce({}, (b, [key, value]) => {
          return {
            ...b,
            [key]: value,
          }
        }),
      )

      const result = {
        ...intermediateResult,
        ...missingCustomFields,
      }

      // Transform gender format from OF back to PCO format
      if ('gender' in result && result.gender) {
        switch (result.gender) {
          case 'male':
            result.gender = 'Male'
            break
          case 'female':
            result.gender = 'Female'
            break
          default:
            break
        }
      }

      return result
    },
    strict: false,
  })
}
