import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import {
  type BaseWebhookDefinition,
  type ExtractEventType,
  pcoWebhookAdapter,
} from './pcoWebhookAdapter'

// Mock webhook schemas for testing
const MockEventDeliverySchema = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      attributes: Schema.Struct({
        name: Schema.String,
        payload: Schema.Struct({
          data: Schema.Struct({
            attributes: Schema.optional(
              Schema.Struct({
                first_name: Schema.optional(Schema.String),
                last_name: Schema.optional(Schema.String),
              }),
            ),
            id: Schema.String,
            type: Schema.String,
          }),
        }),
      }),
      id: Schema.String,
      type: Schema.Literal('EventDelivery'),
    }),
  ),
})

const MockPersonEventSchema = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      attributes: Schema.Struct({
        email: Schema.NullOr(Schema.String),
        first_name: Schema.String,
        last_name: Schema.String,
      }),
      id: Schema.String,
      relationships: Schema.optional(
        Schema.Struct({
          households: Schema.Struct({
            data: Schema.Array(
              Schema.Struct({
                id: Schema.String,
                type: Schema.Literal('Household'),
              }),
            ),
          }),
        }),
      ),
      type: Schema.Literal('Person'),
    }),
  ),
})

const MockMergeEventSchema = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      attributes: Schema.Struct({
        keepId: Schema.String,
        mergedAt: Schema.String,
        removeId: Schema.String,
      }),
      id: Schema.String,
      type: Schema.Literal('PersonMerge'),
    }),
  ),
})

// Tests for the ExtractEventType utility
effect('Type validation: ExtractEventType correctly extracts event from webhook schema', () =>
  Effect.gen(function* () {
    // This test validates that the type extraction works at compile time
    // We create a function that expects the extracted type and verify it compiles
    const validateExtractedType = (
      event: ExtractEventType<typeof MockEventDeliverySchema>,
    ): {
      id: string
      type: 'EventDelivery'
      attributes: {
        name: string
        payload: {
          data: {
            id: string
            type: string
            attributes?: {
              first_name?: string
              last_name?: string
            }
          }
        }
      }
    } => event

    // Create a mock event that matches the extracted type
    const mockEvent = {
      attributes: {
        name: 'person.created',
        payload: {
          data: {
            attributes: {
              first_name: 'John',
              last_name: 'Doe',
            },
            id: '456',
            type: 'Person',
          },
        },
      },
      id: '123',
      type: 'EventDelivery' as const,
    }

    // This should compile correctly, validating our type extraction
    const result = validateExtractedType(mockEvent)
    expect(result.id).toBe('123')
    expect(result.type).toBe('EventDelivery')
    expect(result.attributes.payload.data.id).toBe('456')
  }),
)

// Tests for upsert operation
effect('pcoWebhookAdapter: upsert operation creates correct definition', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.created',
      extractEntityId: (event) => event.id,
      operation: 'upsert',
      webhookSchema: MockPersonEventSchema,
    })

    // Verify the definition has correct structure
    expect(definition.webhookSchema).toBe(MockPersonEventSchema)
    expect(definition.eventType).toBe('person.created')
    expect(definition.operation).toBe('upsert')
    expect(definition.primaryKey).toBe('externalId')
    expect(typeof definition.extractEntityId).toBe('function')
  }),
)

effect('pcoWebhookAdapter: upsert extractEntityId returns correct string', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.updated',
      extractEntityId: (event) => event.attributes.payload.data.id,
      operation: 'upsert',
      webhookSchema: MockEventDeliverySchema,
    })

    const mockEvent: ExtractEventType<typeof MockEventDeliverySchema> = {
      attributes: {
        name: 'person.updated',
        payload: {
          data: {
            id: 'person-456',
            type: 'Person',
          },
        },
      },
      id: 'delivery-123',
      type: 'EventDelivery',
    }

    const entityId = definition.extractEntityId?.(mockEvent)
    expect(entityId).toBe('person-456')
  }),
)

// Tests for delete operation
effect('pcoWebhookAdapter: delete operation creates correct definition', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.deleted',
      extractEntityId: (event) => event.id,
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    // Verify the definition has correct structure
    expect(definition.webhookSchema).toBe(MockPersonEventSchema)
    expect(definition.eventType).toBe('person.deleted')
    expect(definition.operation).toBe('delete')
    expect(definition.primaryKey).toBe('externalId')
    expect(typeof definition.extractEntityId).toBe('function')
  }),
)

effect('pcoWebhookAdapter: delete extractEntityId returns correct string', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.deleted',
      extractEntityId: (event) => event.id,
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    const mockEvent: ExtractEventType<typeof MockPersonEventSchema> = {
      attributes: {
        email: null,
        first_name: 'Jane',
        last_name: 'Smith',
      },
      id: 'person-789',
      type: 'Person',
    }

    const entityId = definition.extractEntityId?.(mockEvent)
    expect(entityId).toBe('person-789')
  }),
)

// Tests for merge operation
effect('pcoWebhookAdapter: merge operation creates correct definition', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.merged',
      extractEntityId: (event) => ({
        keepId: event.attributes.keepId,
        removeId: event.attributes.removeId,
      }),
      operation: 'merge',
      webhookSchema: MockMergeEventSchema,
    })

    // Verify the definition has correct structure
    expect(definition.webhookSchema).toBe(MockMergeEventSchema)
    expect(definition.eventType).toBe('person.merged')
    expect(definition.operation).toBe('merge')
    expect(definition.primaryKey).toBe('externalId')
    expect(typeof definition.extractEntityId).toBe('function')
  }),
)

effect('pcoWebhookAdapter: merge extractEntityId returns correct object', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.merged',
      extractEntityId: (event) => ({
        keepId: event.attributes.keepId,
        removeId: event.attributes.removeId,
      }),
      operation: 'merge',
      webhookSchema: MockMergeEventSchema,
    })

    const mockEvent: ExtractEventType<typeof MockMergeEventSchema> = {
      attributes: {
        keepId: 'person-keep-123',
        mergedAt: '2024-01-01T00:00:00Z',
        removeId: 'person-remove-456',
      },
      id: 'merge-001',
      type: 'PersonMerge',
    }

    const mergeIds = definition.extractEntityId?.(mockEvent)
    expect(mergeIds).toEqual({
      keepId: 'person-keep-123',
      removeId: 'person-remove-456',
    })
  }),
)

// Type-level tests for operation overloads
effect('Type validation: upsert operation requires extractEntityId returning string', () =>
  Effect.gen(function* () {
    // This function validates that upsert operation type checking works
    const createUpsertDefinition = (): BaseWebhookDefinition<
      typeof MockPersonEventSchema,
      'person.created',
      'upsert'
    > => {
      return pcoWebhookAdapter({
        eventType: 'person.created',
        extractEntityId: (event) => event.id, // Must return string
        operation: 'upsert',
        webhookSchema: MockPersonEventSchema,
      })
    }

    const definition = createUpsertDefinition()
    expect(definition.operation).toBe('upsert')

    // Verify that the extractEntityId function signature is correct
    if (definition.extractEntityId) {
      const mockEvent: ExtractEventType<typeof MockPersonEventSchema> = {
        attributes: {
          email: null,
          first_name: 'Test',
          last_name: 'User',
        },
        id: 'test-id',
        type: 'Person',
      }
      const result = definition.extractEntityId(mockEvent)
      expect(typeof result).toBe('string')
    }
  }),
)

effect('Type validation: delete operation requires extractEntityId returning string', () =>
  Effect.gen(function* () {
    // This function validates that delete operation type checking works
    const createDeleteDefinition = (): BaseWebhookDefinition<
      typeof MockPersonEventSchema,
      'person.deleted',
      'delete'
    > => {
      return pcoWebhookAdapter({
        eventType: 'person.deleted',
        extractEntityId: (event) => event.id, // Must return string
        operation: 'delete',
        webhookSchema: MockPersonEventSchema,
      })
    }

    const definition = createDeleteDefinition()
    expect(definition.operation).toBe('delete')

    // Verify that the extractEntityId function signature is correct
    if (definition.extractEntityId) {
      const mockEvent: ExtractEventType<typeof MockPersonEventSchema> = {
        attributes: {
          email: 'delete@test.com',
          first_name: 'Delete',
          last_name: 'Test',
        },
        id: 'delete-test-id',
        type: 'Person',
      }
      const result = definition.extractEntityId(mockEvent)
      expect(typeof result).toBe('string')
    }
  }),
)

effect('Type validation: merge operation requires extractEntityId returning merge object', () =>
  Effect.gen(function* () {
    // This function validates that merge operation type checking works
    const createMergeDefinition = (): BaseWebhookDefinition<
      typeof MockMergeEventSchema,
      'person.merged',
      'merge'
    > => {
      return pcoWebhookAdapter({
        eventType: 'person.merged',
        extractEntityId: (event) => ({
          keepId: event.attributes.keepId,
          removeId: event.attributes.removeId,
        }), // Must return { keepId: string; removeId: string }
        operation: 'merge',
        webhookSchema: MockMergeEventSchema,
      })
    }

    const definition = createMergeDefinition()
    expect(definition.operation).toBe('merge')

    // Verify that the extractEntityId function signature is correct
    if (definition.extractEntityId) {
      const mockEvent: ExtractEventType<typeof MockMergeEventSchema> = {
        attributes: {
          keepId: 'keep-123',
          mergedAt: '2024-01-01T00:00:00Z',
          removeId: 'remove-456',
        },
        id: 'merge-test-id',
        type: 'PersonMerge',
      }
      const result = definition.extractEntityId(mockEvent)
      expect(result).toHaveProperty('keepId')
      expect(result).toHaveProperty('removeId')
      expect((result as any).keepId).toBe('keep-123')
      expect((result as any).removeId).toBe('remove-456')
    }
  }),
)

// Test that primaryKey is always 'externalId' regardless of operation
effect('pcoWebhookAdapter: primaryKey is always externalId for all operations', () =>
  Effect.gen(function* () {
    const upsertDef = pcoWebhookAdapter({
      eventType: 'person.created',
      extractEntityId: (event) => event.id,
      operation: 'upsert',
      webhookSchema: MockPersonEventSchema,
    })

    const deleteDef = pcoWebhookAdapter({
      eventType: 'person.deleted',
      extractEntityId: (event) => event.id,
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    const mergeDef = pcoWebhookAdapter({
      eventType: 'person.merged',
      extractEntityId: (event) => ({
        keepId: event.attributes.keepId,
        removeId: event.attributes.removeId,
      }),
      operation: 'merge',
      webhookSchema: MockMergeEventSchema,
    })

    expect(upsertDef.primaryKey).toBe('externalId')
    expect(deleteDef.primaryKey).toBe('externalId')
    expect(mergeDef.primaryKey).toBe('externalId')
  }),
)

// Test ExtractEventType with nested array structure
effect('Type validation: ExtractEventType handles complex nested structures', () =>
  Effect.gen(function* () {
    const ComplexEventSchema = Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          attributes: Schema.Struct({
            items: Schema.Array(
              Schema.Struct({
                itemId: Schema.String,
                itemName: Schema.String,
              }),
            ),
            nested: Schema.Struct({
              deeply: Schema.Struct({
                value: Schema.Number,
              }),
            }),
          }),
          id: Schema.String,
          meta: Schema.optional(
            Schema.Struct({
              timestamp: Schema.String,
              version: Schema.Number,
            }),
          ),
          type: Schema.Literal('ComplexEvent'),
        }),
      ),
    })

    // Validate that ExtractEventType correctly extracts the complex nested type
    const validateComplexType = (
      event: ExtractEventType<typeof ComplexEventSchema>,
    ): {
      id: string
      type: 'ComplexEvent'
      attributes: {
        nested: {
          deeply: {
            value: number
          }
        }
        items: ReadonlyArray<{
          itemId: string
          itemName: string
        }>
      }
      meta?: {
        timestamp: string
        version: number
      }
    } => event

    const mockComplexEvent = {
      attributes: {
        items: [
          { itemId: 'item-1', itemName: 'First Item' },
          { itemId: 'item-2', itemName: 'Second Item' },
        ],
        nested: {
          deeply: {
            value: 42,
          },
        },
      },
      id: 'complex-123',
      meta: {
        timestamp: '2024-01-01T00:00:00Z',
        version: 1,
      },
      type: 'ComplexEvent' as const,
    }

    const result = validateComplexType(mockComplexEvent)
    expect(result.id).toBe('complex-123')
    expect(result.attributes.nested.deeply.value).toBe(42)
    expect(result.attributes.items).toHaveLength(2)
    expect(result.meta?.version).toBe(1)
  }),
)

// Test that definitions preserve all input parameters
effect('pcoWebhookAdapter: definitions preserve all input parameters', () =>
  Effect.gen(function* () {
    const customSchema = Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          customField: Schema.String,
          id: Schema.String,
        }),
      ),
    })

    const definition = pcoWebhookAdapter({
      eventType: 'custom.event.type',
      extractEntityId: (event) => event.customField,
      operation: 'upsert',
      webhookSchema: customSchema,
    })

    // Verify all parameters are preserved
    expect(definition.webhookSchema).toBe(customSchema)
    expect(definition.eventType).toBe('custom.event.type')
    expect(definition.operation).toBe('upsert')
    expect(definition.primaryKey).toBe('externalId')

    // Test the extractEntityId function
    const mockEvent: ExtractEventType<typeof customSchema> = {
      customField: 'custom-value',
      id: 'test-id',
    }
    expect(definition.extractEntityId?.(mockEvent)).toBe('custom-value')
  }),
)

// Edge case: Test with minimal webhook schema
effect('pcoWebhookAdapter: handles minimal webhook schema', () =>
  Effect.gen(function* () {
    const MinimalSchema = Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String,
        }),
      ),
    })

    const definition = pcoWebhookAdapter({
      eventType: 'minimal.event',
      extractEntityId: (event) => event.id,
      operation: 'delete',
      webhookSchema: MinimalSchema,
    })

    expect(definition.webhookSchema).toBe(MinimalSchema)
    expect(definition.eventType).toBe('minimal.event')
    expect(definition.operation).toBe('delete')
    expect(definition.primaryKey).toBe('externalId')

    const mockEvent: ExtractEventType<typeof MinimalSchema> = {
      id: 'minimal-id',
    }
    expect(definition.extractEntityId?.(mockEvent)).toBe('minimal-id')
  }),
)

// Test type safety with incorrect return types (these should be compile-time tests)
effect('Type validation: operation overloads enforce correct extractEntityId return types', () =>
  Effect.gen(function* () {
    // Test that we can create valid definitions for each operation
    const validUpsert = pcoWebhookAdapter({
      eventType: 'test.upsert',
      extractEntityId: () => 'string-id', // Valid: returns string
      operation: 'upsert',
      webhookSchema: MockPersonEventSchema,
    })

    const validDelete = pcoWebhookAdapter({
      eventType: 'test.delete',
      extractEntityId: () => 'string-id', // Valid: returns string
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    const validMerge = pcoWebhookAdapter({
      eventType: 'test.merge',
      extractEntityId: () => ({
        keepId: 'keep',
        removeId: 'remove',
      }), // Valid: returns merge object
      operation: 'merge',
      webhookSchema: MockMergeEventSchema,
    })

    expect(validUpsert.operation).toBe('upsert')
    expect(validDelete.operation).toBe('delete')
    expect(validMerge.operation).toBe('merge')

    // The following would fail at compile time (commented out to keep tests passing):
    // const invalidUpsert = pcoWebhookAdapter({
    //   webhookSchema: MockPersonEventSchema,
    //   eventType: 'test.upsert',
    //   operation: 'upsert',
    //   extractEntityId: (event) => ({ keepId: 'a', removeId: 'b' }) // Type error: should return string
    // })

    // const invalidMerge = pcoWebhookAdapter({
    //   webhookSchema: MockMergeEventSchema,
    //   eventType: 'test.merge',
    //   operation: 'merge',
    //   extractEntityId: (event) => 'string' // Type error: should return merge object
    // })
  }),
)
