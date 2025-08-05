import { peopleTable } from '@openfaith/db'
import { OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BasePerson = BaseSystemFieldsSchema.pipe(
  Schema.extend(
    Schema.Struct({
      _tag: Schema.Literal('person').annotations({
        [OfUiConfig]: {
          field: {
            hidden: true,
          },
          table: {
            hidden: true,
          },
        },
      }),
      anniversary: Schema.String.annotations({
        description: 'The anniversary of the person',
        [OfUiConfig]: {
          table: {
            cellType: 'date',
            order: 8,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      avatar: Schema.String.annotations({
        description: 'The avatar of the person',
        [OfUiConfig]: {
          table: {
            cellType: 'avatar',
            order: 0,
            width: 60,
          },
        },
      }).pipe(Schema.NullOr),
      birthdate: Schema.String.annotations({
        description: 'The birthdate of the person',
        [OfUiConfig]: {
          field: {
            order: 5,
            type: 'date',
          },
          table: {
            cellType: 'date',
            order: 7,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      firstName: Schema.String.annotations({
        description: 'The first name of the person',
        [OfUiConfig]: {
          field: {
            order: 1,
          },
          table: {
            filterable: true,
            order: 2,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      gender: Schema.Literal('male', 'female')
        .annotations({
          description: 'The gender of the person. He made them male and female.',
          [OfUiConfig]: {
            field: {
              options: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ],
              order: 4,
              type: 'select',
            },
            table: {
              cellType: 'badge',
              filterable: true,
              order: 6,
              sortable: true,
            },
          },
        })
        .pipe(Schema.NullOr),
      lastName: Schema.String.annotations({
        description: 'The last name of the person',
        [OfUiConfig]: {
          field: {
            order: 2,
          },
          table: {
            filterable: true,
            order: 3,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      membership: Schema.String.annotations({
        description: 'The membership of the person',
        [OfUiConfig]: {
          table: {
            cellType: 'badge',
            filterable: true,
            order: 9,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      middleName: Schema.String.annotations({
        description: 'The middle name of the person',
        [OfUiConfig]: {
          field: {
            order: 3,
          },
          table: {
            order: 4,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      name: Schema.String.annotations({
        description: 'The full name of the person',
        [OfUiConfig]: {
          table: {
            filterable: true,
            order: 1,
            pinned: 'left',
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      type: Schema.Literal('default').annotations({
        [OfUiConfig]: {
          field: {
            hidden: true,
          },
          table: {
            hidden: true,
          },
        },
      }),
    }),
  ),
)
export type BasePerson = typeof BasePerson.Type

export const Person = BasePerson.pipe(Schema.extend(IdentificationFieldsSchema)).annotations({
  title: 'person',
  [OfTable]: peopleTable,
  [OfUiConfig]: {
    navigation: {
      description: 'Manage people in your organization',
      enabled: true,
      icon: 'personIcon',
      module: 'directory',
      order: 1,
      title: 'People',
    },
  },
})

export type Person = typeof Person.Type
