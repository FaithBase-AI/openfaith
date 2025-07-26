import { peopleTable } from '@openfaith/db'
import { OfTable } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BasePerson = Schema.Struct({
  ...BaseSystemFieldsSchema.fields,
  _tag: Schema.Literal('person'),
  anniversary: Schema.String.annotations({
    description: 'The anniversary of the person',
  }).pipe(Schema.NullOr),
  avatar: Schema.String.annotations({
    description: 'The avatar of the person',
  }).pipe(Schema.NullOr),
  birthdate: Schema.String.annotations({
    description: 'The birthdate of the person',
  }).pipe(Schema.NullOr),
  firstName: Schema.String.annotations({
    description: 'The first name of the person',
  }).pipe(Schema.NullOr),
  gender: Schema.Literal('male', 'female')
    .annotations({
      description: 'The gender of the person. He made them male and female.',
    })
    .pipe(Schema.NullOr),
  lastName: Schema.String.annotations({
    description: 'The last name of the person',
  }).pipe(Schema.NullOr),
  membership: Schema.String.annotations({
    description: 'The membership of the person',
  }).pipe(Schema.NullOr),
  middleName: Schema.String.annotations({
    description: 'The middle name of the person',
  }).pipe(Schema.NullOr),
  name: Schema.String.annotations({
    description: 'The full name of the person',
  }).pipe(Schema.NullOr),
  type: Schema.Literal('default'),
}).annotations({
  [OfTable]: peopleTable,
})
export type BasePerson = typeof BasePerson.Type

export const Person = Schema.Struct({
  ...BasePerson.fields,
  ...IdentificationFieldsSchema.fields,
})

export type Person = typeof Person.Type
