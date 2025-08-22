import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { type ExtractEventType, pcoWebhookAdapter } from './pcoWebhookAdapter'

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

const MockPersonMergeEventSchema = Schema.Struct({
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
    // ExtractEventType now returns the full schema type (no extraction from data array)
    const validateExtractedType = (event: ExtractEventType<typeof MockEventDeliverySchema>) => event

    // Create a mock event that matches the extracted type
    // ExtractEventType returns the full schema type (with data array)
    const mockEvent = {
      data: [
        {
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
        },
      ],
    }

    // This should compile correctly, validating our type extraction
    const result = validateExtractedType(mockEvent)
    expect(result.data[0]?.id).toBe('123')
    expect(result.data[0]?.type).toBe('EventDelivery')
    expect(result.data[0]?.attributes.payload.data.id).toBe('456')
  }),
)

// Tests for upsert operation
effect('pcoWebhookAdapter: upsert operation creates correct definition', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.created',
      extractEntityId: (event) => event.data[0]?.id ?? '',
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
      extractEntityId: (event) => event.data[0]?.attributes.payload.data.id ?? '',
      operation: 'upsert',
      webhookSchema: MockEventDeliverySchema,
    })

    const mockEvent: ExtractEventType<typeof MockEventDeliverySchema> = {
      data: [
        {
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
        },
      ],
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
      extractEntityId: (event) => event.data[0]?.id ?? '',
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    expect(definition.operation).toBe('delete')
    expect(definition.eventType).toBe('person.deleted')
    expect(typeof definition.extractEntityId).toBe('function')
  }),
)

effect('pcoWebhookAdapter: delete extractEntityId returns correct string', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.deleted',
      extractEntityId: (event) => event.data[0]?.id ?? '',
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    const mockEvent: ExtractEventType<typeof MockPersonEventSchema> = {
      data: [
        {
          attributes: {
            email: 'john@example.com',
            first_name: 'John',
            last_name: 'Doe',
          },
          id: 'person-789',
          type: 'Person',
        },
      ],
    }

    const entityId = definition.extractEntityId?.(mockEvent)
    expect(entityId).toBe('person-789')
  }),
)

// Tests for merge operation
effect('pcoWebhookAdapter: merge operation creates correct definition', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.merge',
      extractEntityId: (event) => ({
        keepId: event.data[0]?.attributes.keepId ?? '',
        removeId: event.data[0]?.attributes.removeId ?? '',
      }),
      operation: 'merge',
      webhookSchema: MockPersonMergeEventSchema,
    })

    expect(definition.operation).toBe('merge')
    expect(definition.eventType).toBe('person.merge')
    expect(typeof definition.extractEntityId).toBe('function')
  }),
)

effect('pcoWebhookAdapter: merge extractEntityId returns correct object', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'person.merge',
      extractEntityId: (event) => ({
        keepId: event.data[0]?.attributes.keepId ?? '',
        removeId: event.data[0]?.attributes.removeId ?? '',
      }),
      operation: 'merge',
      webhookSchema: MockPersonMergeEventSchema,
    })

    const mockEvent: ExtractEventType<typeof MockPersonMergeEventSchema> = {
      data: [
        {
          attributes: {
            keepId: 'person-keep-123',
            mergedAt: '2024-01-01T00:00:00Z',
            removeId: 'person-remove-456',
          },
          id: 'merge-event-123',
          type: 'PersonMerge',
        },
      ],
    }

    const result = definition.extractEntityId?.(mockEvent)
    expect(result).toEqual({
      keepId: 'person-keep-123',
      removeId: 'person-remove-456',
    })
  }),
)

// Type-specific tests to ensure extractEntityId is properly typed
effect('Type validation: extractEntityId parameter types match webhook schema for upsert', () =>
  Effect.gen(function* () {
    // This test validates compile-time type checking
    const definition = pcoWebhookAdapter({
      eventType: 'test.upsert',
      extractEntityId: (event) => event.data[0]?.id ?? '', // Must return string
      operation: 'upsert',
      webhookSchema: MockPersonEventSchema,
    })

    // Create a mock event that matches the schema
    const mockEvent: ExtractEventType<typeof MockPersonEventSchema> = {
      data: [
        {
          attributes: {
            email: null,
            first_name: 'Test',
            last_name: 'User',
          },
          id: 'test-id',
          type: 'Person',
        },
      ],
    }

    const result = definition.extractEntityId?.(mockEvent)
    expect(typeof result).toBe('string')
  }),
)

effect('Type validation: extractEntityId parameter types match webhook schema for delete', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'test.delete',
      extractEntityId: (event) => event.data[0]?.id ?? '', // Must return string
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    const mockEvent: ExtractEventType<typeof MockPersonEventSchema> = {
      data: [
        {
          attributes: {
            email: null,
            first_name: 'Test',
            last_name: 'User',
          },
          id: 'test-id',
          type: 'Person',
        },
      ],
    }

    const result = definition.extractEntityId?.(mockEvent)
    expect(typeof result).toBe('string')
  }),
)

effect('Type validation: extractEntityId parameter types match webhook schema for merge', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'test.merge',
      extractEntityId: (event) => ({
        keepId: event.data[0]?.attributes.keepId ?? '',
        removeId: event.data[0]?.attributes.removeId ?? '',
      }),
      operation: 'merge',
      webhookSchema: MockPersonMergeEventSchema,
    })

    const mockEvent: ExtractEventType<typeof MockPersonMergeEventSchema> = {
      data: [
        {
          attributes: {
            keepId: 'keep-id',
            mergedAt: '2024-01-01',
            removeId: 'remove-id',
          },
          id: 'merge-id',
          type: 'PersonMerge',
        },
      ],
    }

    const result = definition.extractEntityId?.(mockEvent)
    expect(result).toHaveProperty('keepId')
    expect(result).toHaveProperty('removeId')
  }),
)

// Tests for definitions without extractEntityId
effect('pcoWebhookAdapter: definitions work without extractEntityId', () =>
  Effect.gen(function* () {
    const upsertDef = pcoWebhookAdapter({
      eventType: 'test.created',
      extractEntityId: (event) => event.data[0]?.id ?? '',
      operation: 'upsert',
      webhookSchema: MockPersonEventSchema,
    })

    const deleteDef = pcoWebhookAdapter({
      eventType: 'test.deleted',
      extractEntityId: (event) => event.data[0]?.id ?? '',
      operation: 'delete',
      webhookSchema: MockPersonEventSchema,
    })

    const mergeDef = pcoWebhookAdapter({
      eventType: 'test.merged',
      extractEntityId: (event) => ({
        keepId: event.data[0]?.attributes.keepId ?? '',
        removeId: event.data[0]?.attributes.removeId ?? '',
      }),
      operation: 'merge',
      webhookSchema: MockPersonMergeEventSchema,
    })

    expect(upsertDef.extractEntityId).toBeDefined()
    expect(deleteDef.extractEntityId).toBeDefined()
    expect(mergeDef.extractEntityId).toBeDefined()
  }),
)

// Test complex nested schemas
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

effect('Type validation: ExtractEventType works with complex nested schemas', () =>
  Effect.gen(function* () {
    const validateComplexType = (event: ExtractEventType<typeof ComplexEventSchema>) => event

    const mockComplexEvent = {
      data: [
        {
          attributes: {
            items: [
              { itemId: '1', itemName: 'Item 1' },
              { itemId: '2', itemName: 'Item 2' },
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
        },
      ],
    }

    const result = validateComplexType(mockComplexEvent)
    expect(result.data[0]?.id).toBe('complex-123')
    expect(result.data[0]?.attributes.nested.deeply.value).toBe(42)
    expect(result.data[0]?.attributes.items).toHaveLength(2)
  }),
)

// Test with minimal schemas
const MinimalSchema = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      customField: Schema.String,
      id: Schema.String,
    }),
  ),
})

effect('pcoWebhookAdapter: works with minimal schemas', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'minimal.event',
      extractEntityId: (event) => event.data[0]?.customField ?? '',
      operation: 'upsert',
      webhookSchema: MinimalSchema,
    })

    const mockEvent: ExtractEventType<typeof MinimalSchema> = {
      data: [
        {
          customField: 'custom-value',
          id: 'minimal-id',
        },
      ],
    }

    const entityId = definition.extractEntityId?.(mockEvent)
    expect(entityId).toBe('custom-value')
  }),
)

// Test that optional extractEntityId is handled correctly
const SimpleIdSchema = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
    }),
  ),
})

effect('pcoWebhookAdapter: optional extractEntityId for different operations', () =>
  Effect.gen(function* () {
    const upsertDef = pcoWebhookAdapter({
      eventType: 'simple.upsert',
      extractEntityId: (event) => event.data[0]?.id ?? '',
      operation: 'upsert',
      webhookSchema: SimpleIdSchema,
    })

    const mockEvent: ExtractEventType<typeof SimpleIdSchema> = {
      data: [
        {
          id: 'simple-id',
        },
      ],
    }

    const upsertId = upsertDef.extractEntityId?.(mockEvent)
    expect(upsertId).toBe('simple-id')
  }),
)

// Tests for webhook definitions that expect specific event shapes
effect('pcoWebhookAdapter: webhook schemas with actual event shape (EventDelivery)', () =>
  Effect.gen(function* () {
    const definition = pcoWebhookAdapter({
      eventType: 'people.v2.events.person.created',
      extractEntityId: (event) => event.data[0]?.attributes.payload.data.id ?? '',
      operation: 'upsert',
      webhookSchema: MockEventDeliverySchema,
    })

    const mockEvent = {
      data: [
        {
          attributes: {
            name: 'people.v2.events.person.created',
            payload: {
              data: {
                attributes: {
                  first_name: 'Jane',
                  last_name: 'Doe',
                },
                id: '789',
                type: 'Person',
              },
            },
          },
          id: 'event-123',
          type: 'EventDelivery' as const,
        },
      ],
    }

    const extractedId = definition.extractEntityId!(mockEvent as any)
    expect(extractedId).toBe('789')
  }),
)
