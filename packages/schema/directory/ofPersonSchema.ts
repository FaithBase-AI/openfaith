import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BasePerson = Schema.TaggedStruct('person', {
  ...BaseSystemFieldsSchema.fields,
  anniversary: Schema.String.annotations({
    description: 'The anniversary of the person',
  }).pipe(Schema.optional),
  avatar: Schema.String.annotations({
    description: 'The avatar of the person',
  }).pipe(Schema.optional),
  birthdate: Schema.String.annotations({
    description: 'The birthdate of the person',
  }).pipe(Schema.optional),
  firstName: Schema.String.annotations({
    description: 'The first name of the person',
  }).pipe(Schema.optional),
  gender: Schema.Literal('male', 'female')
    .annotations({
      description: 'The gender of the person. He made them male and female.',
    })
    .pipe(Schema.optional),
  lastName: Schema.String.annotations({
    description: 'The last name of the person',
  }).pipe(Schema.optional),
  membership: Schema.String.annotations({
    description: 'The membership of the person',
  }).pipe(Schema.optional),
  middleName: Schema.String.annotations({
    description: 'The middle name of the person',
  }).pipe(Schema.optional),
  name: Schema.String.annotations({
    description: 'The full name of the person',
  }).pipe(Schema.optional),
  type: Schema.Literal('default'),
})
export type BasePerson = typeof BasePerson.Type

export const Person = Schema.Struct({
  ...BasePerson.fields,
  ...IdentificationFieldsSchema.fields,
})

export type Person = typeof Person.Type
