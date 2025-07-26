import { PcoAddress } from '@openfaith/pco/modules/people/pcoAddressSchema'
import { PcoCampus } from '@openfaith/pco/modules/people/pcoCampusSchema'
import { PcoPerson } from '@openfaith/pco/modules/people/pcoPersonSchema'
import { PcoPhoneNumber } from '@openfaith/pco/modules/people/pcoPhoneNumberSchema'
import { OfEntity, OfTable, OfTransformer } from '@openfaith/schema'
import { Array, Option, type Schema, SchemaAST } from 'effect'

// Registry of PCO schemas mapped by their type
const pcoSchemas = {
  Address: PcoAddress,
  Campus: PcoCampus,
  Person: PcoPerson,
  PhoneNumber: PcoPhoneNumber,
}

export type PcoEntityType = keyof typeof pcoSchemas

// Helper function to get entity metadata from schema annotations
export const getEntityMetadata = (schema: Schema.Schema<any, any, any>) => {
  const entityOpt = SchemaAST.getAnnotation<string>(OfEntity)(schema.ast)
  const transformerOpt = SchemaAST.getAnnotation<any>(OfTransformer)(schema.ast)
  const tableOpt = SchemaAST.getAnnotation<any>(OfTable)(schema.ast)

  return {
    entity: entityOpt,
    table: tableOpt,
    transformer: transformerOpt,
  }
}

// Get metadata for a PCO entity type
export const getPcoEntityMetadata = (entityType: string) => {
  if (!(entityType in pcoSchemas)) {
    return Option.none()
  }

  const schema = pcoSchemas[entityType as PcoEntityType]
  const metadata = getEntityMetadata(schema)

  return Option.some({
    ofEntity: metadata.entity,
    schema,
    table: metadata.table,
    transformer: metadata.transformer,
  })
}

// Get all registered PCO entity types
export const getPcoEntityTypes = (): ReadonlyArray<PcoEntityType> =>
  Array.fromIterable(Object.keys(pcoSchemas)) as ReadonlyArray<PcoEntityType>

// Check if an entity type is supported
export const isPcoEntityTypeSupported = (entityType: string): entityType is PcoEntityType =>
  entityType in pcoSchemas
