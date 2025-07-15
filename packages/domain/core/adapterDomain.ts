import { Schema } from 'effect'

// Input schema for adapter connect
export class AdapterConnectInput extends Schema.Class<AdapterConnectInput>('AdapterConnectInput')({
  adapter: Schema.String,
  code: Schema.String,
  redirectUri: Schema.String,
}) {}

// Output schema for adapter connect
export const AdapterConnectOutput = Schema.Literal('success')

// Error schema for when adapter connect fails
export class AdapterConnectError extends Schema.TaggedError<AdapterConnectError>(
  'AdapterConnectError',
)('AdapterConnectError', {
  adapter: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.String),
  message: Schema.String,
}) {
  get message(): string {
    return `Adapter connect failed${this.adapter ? ` for ${this.adapter}` : ''}: ${this.message}${this.cause ? ` (${this.cause})` : ''}`
  }
}
