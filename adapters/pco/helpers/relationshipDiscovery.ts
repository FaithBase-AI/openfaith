import * as PcoSchemas from '@openfaith/pco/schemas'
import {
  extractAST,
  extractEntityName,
  getAnnotationFromSchema,
  OfEntity,
  OfSkipField,
} from '@openfaith/schema'
import { Array, Option, pipe, Record, Schema, SchemaAST } from 'effect'

/**
 * Helper to check if an AST represents null or undefined
 */
const isNullOrUndefined = (ast: SchemaAST.AST): boolean =>
  ast._tag === 'UndefinedKeyword' || (SchemaAST.isLiteral(ast) && ast.literal === null)

/**
 * Unwraps optional and nullable schemas to get the underlying type
 * Handles Union types created by Schema.optional() and Schema.NullOr()
 *
 * This is similar to patterns in introspection.ts but specialized for relationship discovery
 */
const unwrapOptionalAndNullable = (ast: SchemaAST.AST): SchemaAST.AST => {
  if (SchemaAST.isUnion(ast)) {
    // Find the first non-null, non-undefined type in the union
    const nonOptionalType = pipe(
      ast.types,
      Array.findFirst((t) => !isNullOrUndefined(t)),
    )
    if (Option.isSome(nonOptionalType)) {
      return unwrapOptionalAndNullable(nonOptionalType.value)
    }
  }

  if (SchemaAST.isTransformation(ast)) {
    return unwrapOptionalAndNullable(ast.from)
  }

  return ast
}

/**
 * Extracts entity type from array or single relationship data structure
 * Handles both { data: { type: 'EntityType' } } and { data: Array<{ type: 'EntityType' }> }
 *
 * This follows the pattern of recursive type traversal seen in introspection utilities
 */
const extractEntityTypeFromDataField = (dataType: SchemaAST.AST): Option.Option<string> => {
  // Handle Union types (e.g., NullOr)
  if (SchemaAST.isUnion(dataType)) {
    return pipe(
      dataType.types,
      Array.findFirst((t) => SchemaAST.isTypeLiteral(t) || t._tag === 'TupleType'),
      Option.flatMap(extractEntityTypeFromDataField),
    )
  }

  // Handle arrays: Schema.Array creates a TupleType with rest elements
  // The rest array contains Schema Type objects (not AST directly)
  if (dataType._tag === 'TupleType' && dataType.rest.length > 0) {
    const restType = dataType.rest[0] as any
    if (restType?.type) {
      // The 'type' property contains the actual AST for the array element
      return extractEntityTypeFromDataField(restType.type)
    }
  }

  // Handle TypeLiteral (single object or array element)
  if (SchemaAST.isTypeLiteral(dataType)) {
    const typeFieldOpt = pipe(
      dataType.propertySignatures,
      Array.findFirst((prop) => prop.name === 'type'),
    )

    if (Option.isSome(typeFieldOpt)) {
      const typeFieldAST = extractAST(typeFieldOpt.value)
      if (SchemaAST.isLiteral(typeFieldAST) && typeof typeFieldAST.literal === 'string') {
        return Option.some(typeFieldAST.literal.toLowerCase())
      }
    }
  }

  return Option.none()
}

/**
 * Discovers relationship annotations for a PCO entity type
 * Returns a map of relationship keys to their target entity types
 */
export const discoverPcoRelationships = (entityType: string): Record<string, string> => {
  // Find the schema for this entity type in PcoSchemas
  const schemaOpt = pipe(
    PcoSchemas,
    Record.toEntries,
    Array.findFirst(([name]) => {
      // Match by name pattern (e.g., "PcoPerson" for "Person")
      return name === `Pco${entityType}` || name === entityType
    }),
    Option.map(([, schema]) => schema),
  )

  if (Option.isNone(schemaOpt)) {
    return {}
  }

  const schema = schemaOpt.value
  if (!Schema.isSchema(schema)) {
    return {}
  }

  const schemaObj = schema as Schema.Schema<any, any, never>
  const ast = schemaObj.ast

  // Extract relationships from the schema AST
  const extractRelationships = (ast: SchemaAST.AST): Record<string, string> => {
    if (SchemaAST.isTypeLiteral(ast)) {
      // Find the relationships property
      const relationshipsFieldOpt = pipe(
        ast.propertySignatures,
        Array.findFirst((prop) => prop.name === 'relationships'),
      )

      if (Option.isNone(relationshipsFieldOpt)) {
        return {}
      }

      const relType = relationshipsFieldOpt.value.type
      if (!SchemaAST.isTypeLiteral(relType)) {
        return {}
      }

      // Extract each relationship
      return pipe(
        relType.propertySignatures,
        Array.filterMap((relProp) => {
          const relKey = relProp.name
          if (typeof relKey !== 'string') {
            return Option.none()
          }

          // Check for OfSkipField annotation using the shared helper
          const skipFieldOpt = getAnnotationFromSchema<boolean>(OfSkipField, relProp.type)
          if (Option.isSome(skipFieldOpt) && skipFieldOpt.value) {
            return Option.none()
          }

          // Unwrap optional/nullable wrappers
          const unwrappedType = unwrapOptionalAndNullable(relProp.type)

          // Check for OfEntity annotation using the shared helper
          const ofEntityOpt = getAnnotationFromSchema<any>(OfEntity, unwrappedType)

          if (Option.isSome(ofEntityOpt)) {
            // Has OfEntity annotation - extract the target entity name
            const targetEntityOpt = extractEntityName(ofEntityOpt.value as any)
            return pipe(
              targetEntityOpt,
              Option.map((targetEntity) => [relKey, targetEntity] as const),
            )
          }

          // Fallback: Extract from the PCO API structure
          // Structure: { relKey: { data: { type: 'EntityType' } } } or { data: Array<{ type: 'EntityType' }> }
          if (SchemaAST.isTypeLiteral(unwrappedType)) {
            const dataFieldOpt = pipe(
              unwrappedType.propertySignatures,
              Array.findFirst((prop) => prop.name === 'data'),
            )

            if (Option.isSome(dataFieldOpt)) {
              // Use extractAST to handle PropertySignature properly
              const dataFieldAST = extractAST(dataFieldOpt.value)
              const targetTypeOpt = extractEntityTypeFromDataField(dataFieldAST)
              if (Option.isSome(targetTypeOpt)) {
                return Option.some([relKey, targetTypeOpt.value] as const)
              }
            }
          }

          return Option.none()
        }),
        Record.fromEntries,
      )
    }

    // Handle Transformation (class-based schemas)
    if (SchemaAST.isTransformation(ast)) {
      return extractRelationships(ast.from)
    }

    return {}
  }

  return extractRelationships(ast)
}

/**
 * Discovers all PCO entity schemas and their relationships
 */
export const discoverAllPcoRelationships = (): Record<string, Record<string, string>> => {
  return pipe(
    PcoSchemas,
    Record.toEntries,
    Array.filterMap(([name, schema]) => {
      // Filter for PCO entity schemas (those starting with "Pco")
      if (!name.startsWith('Pco') || !Schema.isSchema(schema)) {
        return Option.none()
      }

      // Extract entity type from name (e.g., "PcoPerson" -> "Person")
      const entityType = name.replace(/^Pco/, '')
      const relationships = discoverPcoRelationships(entityType)

      if (Record.isEmptyRecord(relationships)) {
        return Option.none()
      }

      return Option.some([entityType, relationships] as const)
    }),
    Record.fromEntries,
  )
}
