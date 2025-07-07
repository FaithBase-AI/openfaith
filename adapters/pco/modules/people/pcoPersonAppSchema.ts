import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPersonAppAttributes = Schema.Struct({
  allow_pco_login: Schema.Boolean.annotations({
    [OfFieldName]: 'allowPcoLogin',
    [OfCustomField]: true,
  }),
  people_permissions: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'peoplePermissions',
    [OfCustomField]: true,
  }),
})
export type PcoPersonAppAttributes = typeof PcoPersonAppAttributes.Type

export const PcoPersonApp = mkPcoEntity({
  attributes: PcoPersonAppAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    app: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('App'),
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
  type: 'PersonApp',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-person-app' })
export type PcoPersonApp = typeof PcoPersonApp.Type
