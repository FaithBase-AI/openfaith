import { Array, Option, SchemaAST, pipe } from 'effect'

export const OFFieldName = Symbol.for('ofFieldName')
export const OFCustomField = Symbol.for('ofCustomField')
export const OFSkipField = Symbol.for('ofSkipField')

declare module 'effect/Schema' {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [OFFieldName]?: string
      [OFCustomField]?: boolean
      [OFSkipField]?: boolean
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

  switch (ast._tag) {
    case 'StringKeyword':
      return 'string' as const
    case 'NumberKeyword':
      return 'number' as const
    case 'BooleanKeyword':
      return 'boolean' as const
    default:
      return 'unknown' as const
  }
}
