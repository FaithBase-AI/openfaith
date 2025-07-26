import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoListResultAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoListResultAttributes = typeof PcoListResultAttributes.Type

export const PcoListResult = mkPcoEntity({
  attributes: PcoListResultAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    list: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('List'),
        }),
      ),
    }),
    person: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'ListResult',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-list-result' })
export type PcoListResult = typeof PcoListResult.Type
