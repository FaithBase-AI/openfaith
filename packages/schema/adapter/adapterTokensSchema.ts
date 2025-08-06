import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

// Clean BaseAdapterToken class for transformers (with system fields, no identification fields)
export class BaseAdapterToken extends BaseSystemFields.extend<BaseAdapterToken>('BaseAdapterToken')(
  {
    accessToken: Schema.String.annotations({
      description: 'The access token for the adapter',
    }),
    adapter: Schema.String.annotations({
      description: 'The adapter name: PCO, CCB, etc.',
    }),
    expiresIn: Schema.Number.annotations({
      description: 'The new lifetime in seconds',
    }),
    refreshToken: Schema.String.annotations({
      description: 'The refresh token for the adapter',
    }),
    tokenCreatedAt: Schema.Number.annotations({
      description: 'The time the token was created (epoch seconds)',
    }),
  },
) {}

// Full AdapterToken class that extends BaseAdapterToken and then extends BaseIdentifiedEntity
export class AdapterToken extends BaseAdapterToken.extend<AdapterToken>('AdapterToken')(
  BaseIdentifiedEntity.fields,
) {}
