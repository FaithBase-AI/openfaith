import { emailsTable } from '@openfaith/db'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

// Clean BaseEmail class for transformers (no system fields, no extensions)
export class BaseEmail extends BaseSystemFields.extend<BaseEmail>('BaseEmail')({
  _tag: Schema.Literal('email').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  address: Schema.String.annotations({
    description: 'The email address',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 1,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  blocked: Schema.Boolean.annotations({
    description: 'Whether this email address is blocked',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 3,
        sortable: true,
      },
    },
  }),
  location: Schema.String.annotations({
    description: 'The location type of the email (e.g., Personal, Work, Other)',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 2,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  primary: Schema.Boolean.annotations({
    description: 'Whether this is the primary email address',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 0,
        sortable: true,
      },
    },
  }),
  type: Schema.Literal('default').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
}) {}

// Full Email class that extends BaseEmail and then extends BaseIdentifiedEntity
export class Email extends BaseEmail.extend<Email>('Email')(BaseIdentifiedEntity.fields, [
  // Annotations for the class
  {
    title: 'email',
    [OfTable]: emailsTable,
    [OfUiConfig]: {
      meta: {
        disableCreate: true,
        disableDelete: true,
        disableEdit: true,
      },
      navigation: {
        description: 'Manage contact email addresses',
        enabled: true,
        icon: 'mailIcon',
        module: 'directory',
        order: 6,
        title: 'Emails',
      },
    } satisfies FieldConfig,
  },
]) {
  get displayName(): string {
    const address = this.address || ''
    const location = this.location || ''

    if (address) {
      return location ? `${location}: ${address}` : address
    }

    return `Email ${this.id}`
  }
}
