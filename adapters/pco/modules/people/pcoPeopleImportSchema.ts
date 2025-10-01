import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPeopleImportAttributes = Schema.Struct({
  attribs: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'attribs',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  processed_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'processedAt',
    [OfCustomField]: true,
  }),
  status: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'status',
    [OfCustomField]: true,
  }),
  undone_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'undoneAt',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoPeopleImportAttributes = typeof PcoPeopleImportAttributes.Type

export const PcoPeopleImport = mkPcoEntity({
  attributes: PcoPeopleImportAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    created_by: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
    undone_by: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'PeopleImport',
}).annotations({ [OfSkipEntity]: true, title: 'pco-people-import' })
export type PcoPeopleImport = typeof PcoPeopleImport.Type
