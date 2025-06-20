import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BasePerson = Schema.TaggedStruct('person', {
  ...BaseSystemFieldsSchema.fields,
  anniversary: Schema.String.annotations({
    description: 'The anniversary of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  avatar: Schema.String.annotations({
    description: 'The avatar of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  birthdate: Schema.String.annotations({
    description: 'The birthdate of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  firstName: Schema.String.annotations({
    description: 'The first name of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  gender: Schema.Literal('male', 'female')
    .annotations({
      description: 'The gender of the person. He made them male and female.',
    })
    .pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  lastName: Schema.String.annotations({
    description: 'The last name of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  membership: Schema.String.annotations({
    description: 'The membership of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  middleName: Schema.String.annotations({
    description: 'The middle name of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  name: Schema.String.annotations({
    description: 'The full name of the person',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  type: Schema.Literal('default'),
})
export type BasePerson = typeof BasePerson.Type

export const Person = Schema.Struct({
  ...BasePerson.fields,
  ...IdentificationFieldsSchema.fields,
})

export type Person = typeof Person.Type
