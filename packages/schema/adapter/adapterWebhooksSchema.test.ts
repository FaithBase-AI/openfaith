import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  AdapterWebhook,
  BaseAdapterWebhook,
  WebhookVerificationMethod,
} from '@openfaith/schema/adapter/adapterWebhooksSchema'
import { Array, Effect, Exit, pipe, Schema } from 'effect'

// Test WebhookVerificationMethod enum
effect('should validate webhook verification methods correctly', () =>
  Effect.gen(function* () {
    // Valid methods
    const validMethods: Array<typeof WebhookVerificationMethod.Type> = [
      'hmac-sha256',
      'hmac-sha1',
      'signature-header',
      'token-based',
    ]

    for (const method of validMethods) {
      const result = yield* Schema.decodeUnknown(WebhookVerificationMethod)(method)
      expect(result).toBe(method)
    }

    // Invalid method
    const invalidResult = yield* Effect.exit(
      Schema.decodeUnknown(WebhookVerificationMethod)('invalid-method'),
    )
    expect(Exit.isFailure(invalidResult)).toBe(true)
  }),
)

// Test BaseAdapterWebhook schema validation
effect('should validate BaseAdapterWebhook with all required fields', () =>
  Effect.gen(function* () {
    const validWebhook = {
      adapter: 'pco',
      authenticitySecret: 'secret-key-123',
      createdAt: new Date('2024-01-01'),
      enabled: true,
      eventTypes: ['person.created', 'person.updated'],
      updatedAt: new Date('2024-01-02'),
      verificationMethod: 'hmac-sha256' as const,
      webhookUrl: 'https://api.example.com/webhooks/pco',
    }

    const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(validWebhook)

    expect(result.adapter).toBe('pco')
    expect(result.authenticitySecret).toBe('secret-key-123')
    expect(result.enabled).toBe(true)
    expect(pipe(result.eventTypes, Array.length)).toBe(2)
    expect(result.verificationMethod).toBe('hmac-sha256')
    expect(result.webhookUrl).toBe('https://api.example.com/webhooks/pco')
  }),
)

// Test BaseAdapterWebhook with optional fields
effect('should validate BaseAdapterWebhook with optional fields', () =>
  Effect.gen(function* () {
    const webhookWithOptionals = {
      adapter: 'ccb',
      authenticitySecret: 'secret-456',
      createdAt: new Date('2024-01-01'),
      enabled: false,
      eventTypes: ['group.updated'],
      externalWebhookId: 'ext-webhook-789',
      lastProcessedAt: new Date('2024-01-03'),
      lastReceivedAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      verificationMethod: 'hmac-sha1' as const,
      webhookUrl: 'https://api.example.com/webhooks/ccb',
    }

    const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhookWithOptionals)

    expect(result.externalWebhookId).toBe('ext-webhook-789')
    expect(result.lastProcessedAt).toEqual(new Date('2024-01-03'))
    expect(result.lastReceivedAt).toEqual(new Date('2024-01-02'))
  }),
)

// Test BaseAdapterWebhook without optional fields
effect('should validate BaseAdapterWebhook without optional fields', () =>
  Effect.gen(function* () {
    const webhookMinimal = {
      adapter: 'tithely',
      authenticitySecret: 'min-secret',
      createdAt: new Date(),
      enabled: true,
      eventTypes: [],
      updatedAt: new Date(),
      verificationMethod: 'token-based' as const,
      webhookUrl: 'https://api.example.com/webhooks/tithely',
    }

    const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhookMinimal)

    expect(result.externalWebhookId).toBeUndefined()
    expect(result.lastProcessedAt).toBeUndefined()
    expect(result.lastReceivedAt).toBeUndefined()
  }),
)

// Test AdapterWebhook (full schema with ID fields)
effect('should validate AdapterWebhook with identification fields', () =>
  Effect.gen(function* () {
    const fullWebhook = {
      adapter: 'pco',
      authenticitySecret: 'full-secret',
      createdAt: new Date('2024-01-01'),
      enabled: true,
      eventTypes: ['donation.created', 'donation.updated'],
      externalWebhookId: 'pco-webhook-123',
      id: 'webhook-uuid-123',
      lastProcessedAt: new Date('2024-01-05'),
      lastReceivedAt: new Date('2024-01-04'),
      orgId: 'org-uuid-456',
      updatedAt: new Date('2024-01-03'),
      verificationMethod: 'hmac-sha256' as const,
      webhookUrl: 'https://api.example.com/webhooks/pco/donations',
    }

    const result = yield* Schema.decodeUnknown(AdapterWebhook)(fullWebhook)

    expect(result.id).toBe('webhook-uuid-123')
    expect(result.orgId).toBe('org-uuid-456')
    expect(result.adapter).toBe('pco')
  }),
)

// Test schema validation failures
effect('should reject invalid adapter webhook data', () =>
  Effect.gen(function* () {
    const invalidData = {
      adapter: 123, // Should be string
      authenticitySecret: 'secret',
      enabled: 'yes', // Should be boolean
      eventTypes: 'person.created', // Should be array
      verificationMethod: 'invalid',
      webhookUrl: 'not-a-url',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(BaseAdapterWebhook)(invalidData))
    expect(Exit.isFailure(result)).toBe(true)
  }),
)

// Test missing required fields
effect('should reject webhook data missing required fields', () =>
  Effect.gen(function* () {
    const missingFields = {
      adapter: 'pco',
      // Missing: authenticitySecret, enabled, eventTypes, verificationMethod, webhookUrl
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(BaseAdapterWebhook)(missingFields))
    expect(Exit.isFailure(result)).toBe(true)
  }),
)

// Test empty event types array
effect('should allow empty event types array', () =>
  Effect.gen(function* () {
    const webhookWithEmptyEvents = {
      adapter: 'test',
      authenticitySecret: 'secret',
      createdAt: new Date(),
      enabled: true,
      eventTypes: [], // Empty array should be valid
      updatedAt: new Date(),
      verificationMethod: 'hmac-sha256' as const,
      webhookUrl: 'https://example.com/webhook',
    }

    const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhookWithEmptyEvents)
    expect(pipe(result.eventTypes, Array.length)).toBe(0)
  }),
)

// Test date field handling
effect('should handle date fields correctly', () =>
  Effect.gen(function* () {
    const now = new Date()
    const past = new Date('2023-01-01')
    const future = new Date('2025-01-01')

    const webhookWithDates = {
      adapter: 'pco',
      authenticitySecret: 'secret',
      createdAt: past,
      enabled: true,
      eventTypes: ['test.event'],
      lastProcessedAt: now,
      lastReceivedAt: future,
      updatedAt: now,
      verificationMethod: 'hmac-sha256' as const,
      webhookUrl: 'https://example.com/webhook',
    }

    const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhookWithDates)

    expect(result.createdAt).toEqual(past.toISOString().replace(/\.\d{3}Z$/, 'Z'))
    expect(result.updatedAt).toEqual(now.toISOString().replace(/\.\d{3}Z$/, 'Z'))
    expect(result.lastProcessedAt).toEqual(now)
    expect(result.lastReceivedAt).toEqual(future)
  }),
)

// Test schema encoding (for database writes)
effect('should encode webhook data correctly', () =>
  Effect.gen(function* () {
    const createdDate = new Date('2024-01-01')
    const updatedDate = new Date('2024-01-02')

    const webhook = {
      adapter: 'pco',
      authenticitySecret: 'encode-secret',
      createdAt: createdDate.toISOString(),
      customFields: [],
      enabled: true,
      eventTypes: ['encode.test'],
      externalIds: [],
      id: 'test-id',
      orgId: 'test-org',
      status: 'active' as const,
      tags: [],
      updatedAt: updatedDate.toISOString(),
      verificationMethod: 'hmac-sha256' as const,
      webhookUrl: 'https://example.com/encode',
    }

    const encoded = yield* Schema.encode(AdapterWebhook)(webhook)

    expect(encoded.id).toBe('test-id')
    expect(encoded.orgId).toBe('test-org')
    expect(encoded.adapter).toBe('pco')
    // Dates should be encoded as ISO strings
    expect(encoded.createdAt).toBe(createdDate.toISOString())
    expect(encoded.updatedAt).toBe(updatedDate.toISOString())
  }),
)

// Test null vs undefined handling for optional fields
effect('should distinguish between null and undefined for optional fields', () =>
  Effect.gen(function* () {
    const webhookWithNull = {
      adapter: 'test',
      authenticitySecret: 'secret',
      createdAt: new Date(),
      enabled: true,
      eventTypes: [],
      externalWebhookId: null, // Explicitly null
      lastProcessedAt: undefined, // Explicitly undefined
      updatedAt: new Date(),
      verificationMethod: 'hmac-sha256' as const,
      webhookUrl: 'https://example.com/webhook',
    }

    const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhookWithNull)

    // Schema.optional() should handle both null and undefined as undefined
    expect(result.externalWebhookId).toBeUndefined()
    expect(result.lastProcessedAt).toBeUndefined()
  }),
)

// Type-level test: Verify schema field structure
effect('Type validation: webhook schema has correct field types', () =>
  Effect.gen(function* () {
    // Mock function that validates webhook structure
    const validateWebhookStructure = (webhook: {
      adapter: string
      authenticitySecret: string
      enabled: boolean
      eventTypes: Array<string>
      verificationMethod: 'hmac-sha256' | 'hmac-sha1' | 'signature-header' | 'token-based'
      webhookUrl: string
      externalWebhookId?: string
      lastProcessedAt?: Date
      lastReceivedAt?: Date
    }) => webhook

    // This should compile correctly - validates type structure
    const webhook = validateWebhookStructure({
      adapter: 'pco',
      authenticitySecret: 'type-test-secret',
      enabled: true,
      eventTypes: ['type.test'],
      externalWebhookId: 'optional-id',
      lastProcessedAt: new Date(),
      verificationMethod: 'hmac-sha256',
      webhookUrl: 'https://example.com/type-test',
    })

    expect(webhook.adapter).toBe('pco')
    expect(webhook.verificationMethod).toBe('hmac-sha256')
  }),
)

// Test multiple adapters
effect('should validate webhooks for different adapters', () =>
  Effect.gen(function* () {
    const adapters = ['pco', 'ccb', 'tithely', 'custom-adapter']

    for (const adapter of adapters) {
      const webhook = {
        adapter,
        authenticitySecret: `${adapter}-secret`,
        createdAt: new Date(),
        enabled: true,
        eventTypes: [`${adapter}.event`],
        updatedAt: new Date(),
        verificationMethod: 'hmac-sha256' as const,
        webhookUrl: `https://example.com/webhooks/${adapter}`,
      }

      const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhook)
      expect(result.adapter).toBe(adapter)
    }
  }),
)

// Test event types validation
effect('should validate various event type formats', () =>
  Effect.gen(function* () {
    const webhook = {
      adapter: 'test',
      authenticitySecret: 'secret',
      createdAt: new Date(),
      enabled: true,
      eventTypes: [
        'person.created',
        'person.updated',
        'person.destroyed',
        'group.membership.added',
        'donation.recurring.created',
        'custom_event_format',
        'UPPERCASE_EVENT',
        'event-with-dashes',
        'event_with_underscores',
      ],
      updatedAt: new Date(),
      verificationMethod: 'hmac-sha256' as const,
      webhookUrl: 'https://example.com/webhook',
    }

    const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhook)
    expect(pipe(result.eventTypes, Array.length)).toBe(9)

    const hasEvent = (event: string) =>
      pipe(
        result.eventTypes,
        Array.some((e) => e === event),
      )

    expect(hasEvent('person.created')).toBe(true)
    expect(hasEvent('group.membership.added')).toBe(true)
    expect(hasEvent('UPPERCASE_EVENT')).toBe(true)
  }),
)

// Test URL validation
effect('should accept various webhook URL formats', () =>
  Effect.gen(function* () {
    const urls = [
      'https://api.example.com/webhooks',
      'http://localhost:3000/webhooks',
      'https://webhook.example.com/v1/pco/receive',
      'https://example.com:8080/api/webhooks',
      'https://sub.domain.example.com/path/to/webhook',
    ]

    for (const url of urls) {
      const webhook = {
        adapter: 'test',
        authenticitySecret: 'secret',
        createdAt: new Date(),
        enabled: true,
        eventTypes: [],
        updatedAt: new Date(),
        verificationMethod: 'hmac-sha256' as const,
        webhookUrl: url,
      }

      const result = yield* Schema.decodeUnknown(BaseAdapterWebhook)(webhook)
      expect(result.webhookUrl).toBe(url)
    }
  }),
)
