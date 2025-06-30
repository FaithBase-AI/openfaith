import { Workflow } from '@effect/workflow'
import { Effect, Schema } from 'effect'

class TestWorkflowError extends Schema.TaggedError<TestWorkflowError>('TestWorkflowError')(
  'TestWorkflowError',
  {
    message: Schema.String,
  },
) {}

// Define the workflow payload schema with message field
const TestWorkflowPayload = Schema.Struct({
  message: Schema.String,
})

// Define the test workflow
export const TestWorkflow = Workflow.make({
  error: TestWorkflowError,
  idempotencyKey: (payload) => `${payload.message}-${new Date().toISOString()}`,
  name: 'TestWorkflow',
  payload: TestWorkflowPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const TestWorkflowLayer = TestWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🧪 Test Workflow`, payload)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)
    yield* Effect.log(`📩 Message: ${payload.message}`)

    yield* Effect.log(`✅ Test Workflow completed successfully`)

    return
  }),
)
