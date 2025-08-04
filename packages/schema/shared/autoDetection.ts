import { extractLiteralOptions, hasEmailPattern } from '@openfaith/schema/shared/introspection'
import { type FieldConfig, getUnderlyingType } from '@openfaith/schema/shared/schema'
import { Match, pipe, SchemaAST, String } from 'effect'

/**
 * Auto-detects field configuration from schema AST
 */
export const autoDetectFieldConfig = (
  ast: SchemaAST.AST,
  fieldName: string,
): Partial<FieldConfig['field']> => {
  const literalOptions = extractLiteralOptions(ast)
  const underlyingType = getUnderlyingType(ast)
  const lowerFieldName = fieldName.toLowerCase()

  return pipe(
    ast,
    Match.value,
    Match.when(hasEmailPattern, () => ({ type: 'email' as const })),
    Match.orElse(() => {
      if (literalOptions.length > 0) {
        return {
          options: literalOptions,
          type: 'select' as const,
        }
      }

      return pipe(
        underlyingType,
        Match.value,
        Match.when('string', () =>
          pipe(
            lowerFieldName,
            Match.value,
            Match.whenOr(
              String.includes('date'),
              String.includes('anniversary'),
              String.includes('birthday'),
              String.includes('birthdate'),
              () => ({
                placeholder: `Select ${fieldName.toLowerCase()}`,
                type: 'date' as const,
              }),
            ),
            Match.when(String.includes('password'), () => ({
              type: 'password' as const,
            })),
            Match.when(String.includes('slug'), () => ({
              type: 'slug' as const,
            })),
            Match.whenOr(
              String.includes('bio'),
              String.includes('description'),
              String.includes('notes'),
              String.includes('comment'),
              String.includes('message'),
              () => ({ rows: 3, type: 'textarea' as const }),
            ),
            Match.orElse(() => ({ type: 'text' as const })),
          ),
        ),
        Match.when('number', () => ({ type: 'number' as const })),
        Match.when('boolean', () => ({ type: 'switch' as const })),
        Match.orElse(() => {
          if (SchemaAST.isTupleType(ast) || isArrayType(ast)) {
            return { type: 'tags' as const }
          }
          return { type: 'text' as const }
        }),
      )
    }),
  )
}

/**
 * Checks if the AST represents an array type
 */
const isArrayType = (ast: SchemaAST.AST): boolean => {
  if (ast._tag === 'Declaration') {
    return ast.typeParameters.some(
      (param) => param.toString().includes('Array') || param.toString().includes('ReadonlyArray'),
    )
  }

  return false
}

/**
 * Auto-detects table cell configuration from schema AST
 */
export const autoDetectCellConfig = (
  ast: SchemaAST.AST,
  fieldName: string,
): Partial<FieldConfig['table']> => {
  const underlyingType = getUnderlyingType(ast)
  const lowerFieldName = fieldName.toLowerCase()

  return pipe(
    ast,
    Match.value,
    Match.when(hasEmailPattern, () => ({ cellType: 'email' as const })),
    Match.orElse(() =>
      pipe(
        underlyingType,
        Match.value,
        Match.when('string', () =>
          pipe(
            lowerFieldName,
            Match.value,
            Match.whenOr(
              String.includes('avatar'),
              String.includes('image'),
              String.includes('photo'),
              () => ({ cellType: 'avatar' as const }),
            ),
            Match.whenOr(
              String.includes('url'),
              String.includes('link'),
              String.includes('website'),
              () => ({ cellType: 'link' as const }),
            ),
            Match.whenOr(
              String.includes('status'),
              String.includes('type'),
              String.includes('category'),
              () => ({ cellType: 'badge' as const }),
            ),
            Match.when(
              (name) => name === 'name',
              () => ({ cellType: 'entityLink' as const }),
            ),
            Match.orElse(() => ({ cellType: 'text' as const })),
          ),
        ),
        Match.when('number', () =>
          pipe(
            lowerFieldName,
            Match.value,
            Match.whenOr(
              String.includes('price'),
              String.includes('cost'),
              String.includes('amount'),
              String.includes('salary'),
              String.includes('fee'),
              () => ({ cellType: 'currency' as const }),
            ),
            Match.orElse(() => ({ cellType: 'number' as const })),
          ),
        ),
        Match.when('boolean', () => ({ cellType: 'boolean' as const })),
        Match.orElse(() =>
          pipe(
            lowerFieldName,
            Match.value,
            Match.when(
              (name) => pipe(name, String.includes('time')) && !pipe(name, String.includes('date')),
              () => ({ cellType: 'datetime' as const }),
            ),
            Match.whenOr(
              String.includes('date'),
              String.includes('time'),
              String.includes('created'),
              String.includes('updated'),
              () => ({ cellType: 'date' as const }),
            ),
            Match.orElse(() => ({ cellType: 'text' as const })),
          ),
        ),
      ),
    ),
  )
}
