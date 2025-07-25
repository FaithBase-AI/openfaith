import { Schema } from 'effect'

export class UnsupportedAdapterError extends Schema.TaggedError<UnsupportedAdapterError>()(
  'UnsupportedAdapterError',
  {
    adapter: Schema.String,
    message: Schema.optional(Schema.String),
  },
) {}

export class AdapterSyncError extends Schema.TaggedError<AdapterSyncError>()('AdapterSyncError', {
  adapter: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  entityName: Schema.String,
  message: Schema.optional(Schema.String),
  operation: Schema.String,
}) {}

export class AdapterTokenError extends Schema.TaggedError<AdapterTokenError>()(
  'AdapterTokenError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.optional(Schema.String),
  },
) {}

export class AdapterConnectionError extends Schema.TaggedError<AdapterConnectionError>()(
  'AdapterConnectionError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    message: Schema.optional(Schema.String),
  },
) {}

export class AdapterValidationError extends Schema.TaggedError<AdapterValidationError>()(
  'AdapterValidationError',
  {
    adapter: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    entityName: Schema.String,
    field: Schema.String,
    message: Schema.optional(Schema.String),
  },
) {}
