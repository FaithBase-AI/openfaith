import { type PcoPersonSchema, pcoEntityManifest } from '@openfaith/pco/server'
import { extractEntityName, getAnnotationFromSchema, OfEntity, OfFilterFn } from '@openfaith/schema'
import { Option, pipe, type Schema, String } from 'effect'

export const getEntitySchemaOpt = (entityType: string) =>
  entityType in pcoEntityManifest.entities
    ? Option.some(
        pcoEntityManifest.entities[entityType as keyof typeof pcoEntityManifest.entities]
          .apiSchema as PcoPersonSchema,
      )
    : Option.none()

export const getOfEntityNameForPcoEntityType = (entityType: string): string => {
  const normalizedEntityType = pipe(entityType, String.pascalToSnake, String.snakeToCamel)

  return getEntitySchemaOpt(entityType).pipe(
    Option.flatMap(getOfEntityNameForPcoEntitySchemaOpt),
    Option.getOrElse(() => normalizedEntityType),
  )
}

export const getOfEntityNameForPcoEntitySchemaOpt = (
  schema: Schema.Schema<any, any, any>,
): Option.Option<string> =>
  pipe(
    getAnnotationFromSchema<Schema.Schema<any, any, any>>(OfEntity, schema.ast),
    Option.flatMap(extractEntityName),
  )

export const getOfEntityFilterFnForPcoSchemaOpt = <A, I, R>(
  schema: Schema.Schema<A, I, R>,
): Option.Option<(entity: A) => boolean> =>
  pipe(getAnnotationFromSchema<(entity: A) => boolean>(OfFilterFn, schema.ast))
