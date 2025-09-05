import { pcoEntityManifest } from '@openfaith/pco/server'
import { extractEntityName, getAnnotationFromSchema, OfEntity } from '@openfaith/schema'
import { Option, pipe, type Schema, String } from 'effect'

export const getOfEntityNameForPcoEntityType = (entityType: string): string => {
  const normalizedEntityType = pipe(entityType, String.pascalToSnake, String.snakeToCamel)

  if (entityType in pcoEntityManifest) {
    const schema =
      pcoEntityManifest.entities[entityType as keyof typeof pcoEntityManifest.entities].apiSchema

    return pipe(
      schema,
      getOfEntityNameForPcoEntitySchemaOpt,
      Option.getOrElse(() => normalizedEntityType),
    )
  }

  return normalizedEntityType
}

export const getOfEntityNameForPcoEntitySchemaOpt = (
  schema: Schema.Schema<any, any, any>,
): Option.Option<string> =>
  pipe(
    getAnnotationFromSchema<Schema.Schema<any, any, any>>(OfEntity, schema.ast),
    Option.flatMap(extractEntityName),
  )
