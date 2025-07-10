import { Schema } from 'effect'

// Error schema for when the test function fails
export class TestFunctionError extends Schema.TaggedError<TestFunctionError>('TestFunctionError')(
  'TestFunctionError',
  {
    message: Schema.String,
    cause: Schema.optional(Schema.String),
  },
) {
  get message(): string {
    return `Test function failed: ${this.message}${this.cause ? ` (${this.cause})` : ''}`
  }
}
