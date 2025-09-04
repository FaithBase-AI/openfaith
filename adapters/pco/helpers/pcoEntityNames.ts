import { pcoEntityManifest } from '@openfaith/pco/server'
import { extractEntityName, getAnnotationFromSchema, OfEntity } from '@openfaith/schema'
import { Option, pipe, type Schema, String } from 'effect'

export const getOfEntityNameForPcoEntityType = (entityType: string): string => {
  const normalizedEntityType = pipe(entityType, String.pascalToSnake, String.snakeToCamel)

  if (entityType in pcoEntityManifest) {
    const schema = pcoEntityManifest[entityType as keyof typeof pcoEntityManifest].apiSchema

    return pipe(
      getAnnotationFromSchema<Schema.Schema<any, any, any>>(OfEntity, schema.ast),
      Option.flatMap(extractEntityName),
      Option.getOrElse(() => normalizedEntityType),
    )
  }

  return normalizedEntityType
}
