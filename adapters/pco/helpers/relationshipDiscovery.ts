import * as PcoSchemas from '@openfaith/pco/schemas'
import { extractEntityName, getAnnotationFromSchema, OfEntity } from '@openfaith/schema'
import { Array, Option, pipe, Record, Schema, type SchemaAST } from 'effect'

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
    if (ast._tag === 'TypeLiteral') {
      // Find the relationships property
      const relationshipsFieldOpt = pipe(
        ast.propertySignatures,
        Array.findFirst((prop) => prop.name === 'relationships'),
      )

      if (Option.isNone(relationshipsFieldOpt)) {
        return {}
      }

      const relType = relationshipsFieldOpt.value.type
      if (relType._tag !== 'TypeLiteral') {
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

          // Check for OfEntity annotation
          const ofEntityOpt = getAnnotationFromSchema<any>(OfEntity, relProp.type)

          if (Option.isSome(ofEntityOpt)) {
            // Has OfEntity annotation - extract the target entity name
            const targetEntityOpt = extractEntityName(ofEntityOpt.value)

            return pipe(
              targetEntityOpt,
              Option.map((targetEntity) => [relKey, targetEntity] as const),
            )
          }

          // Fallback: Try to extract from the structure
          // Structure: { relKey: { data: { type: 'EntityType' } } }
          if (relProp.type._tag === 'TypeLiteral') {
            const dataFieldOpt = pipe(
              relProp.type.propertySignatures,
              Array.findFirst((prop) => prop.name === 'data'),
            )

            if (Option.isSome(dataFieldOpt)) {
              const dataField = dataFieldOpt.value

              // Handle union types (e.g., NullOr)
              const extractFromDataType = (dataType: SchemaAST.AST): Option.Option<string> => {
                if (dataType._tag === 'Union') {
                  // Try each member of the union
                  return pipe(
                    dataType.types,
                    Array.findFirst((t) => t._tag === 'TypeLiteral'),
                    Option.flatMap(extractFromDataType),
                  )
                }

                if (dataType._tag === 'TypeLiteral') {
                  const typeFieldOpt = pipe(
                    dataType.propertySignatures,
                    Array.findFirst((prop) => prop.name === 'type'),
                  )

                  if (Option.isSome(typeFieldOpt)) {
                    const typeField = typeFieldOpt.value
                    if (
                      typeField.type._tag === 'Literal' &&
                      typeof typeField.type.literal === 'string'
                    ) {
                      return Option.some(typeField.type.literal.toLowerCase())
                    }
                  }
                }

                return Option.none()
              }

              const targetTypeOpt = extractFromDataType(dataField.type)
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
    if (ast._tag === 'Transformation') {
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
