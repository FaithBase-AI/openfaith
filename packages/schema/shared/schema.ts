import { Array, Option, pipe, SchemaAST } from 'effect'

export const OfFieldName = Symbol.for('OfFieldName')
export const OfCustomField = Symbol.for('ofCustomField')
export const OfSkipField = Symbol.for('ofSkipField')
export const OfEntity = Symbol.for('ofEntity')
export const OfEdge = Symbol.for('ofEdge')
export const OfFolder = Symbol.for('ofFolder')
export const OfSkipEntity = Symbol.for('ofSkipEntity')

export type OfEdgeAnnotation = {
  relationshipType: string
  targetEntityTypeTag: string
}

export type OfFolderAnnotation = {
  folderType: string
}

declare module 'effect/Schema' {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [OfFieldName]?: string
      [OfCustomField]?: boolean
      [OfSkipField]?: boolean
      [OfEntity]?: string
      [OfEdge]?: OfEdgeAnnotation
      [OfFolder]?: OfFolderAnnotation
      [OfSkipEntity]?: boolean
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

  // Handle refinement types (e.g., minLength, maxLength, etc.)
  if (SchemaAST.isRefinement(ast)) {
    return getUnderlyingType(ast.from)
  }

  // Handle transformation types
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
      // Determine the type based on the literal value
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
