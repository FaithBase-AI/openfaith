import { expect } from 'bun:test'
import { HttpClient } from '@effect/platform'
import { effect } from '@openfaith/bun-test'
import { MockPcoHttpClientLayer } from '@openfaith/pco/api/pcoMockClient'
import { Effect } from 'effect'

effect('MockPcoHttpClient: returns mock response for Person collection (uses lookup)', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people')
    const json = (yield* response.json) as {
      data: Array<{ type: string; id: string; attributes: { first_name: string } }>
      meta: { count: number; total_count: number }
    }

    expect(json.data).toHaveLength(1)
    const firstPerson = json.data[0]
    if (!firstPerson) {
      throw new Error('Expected first person to exist')
    }
    expect(firstPerson.type).toBe('Person')
    expect(firstPerson.id).toBe('160290623')
    expect(firstPerson.attributes.first_name).toBe('Peter')
    expect(json.meta.count).toBe(1)
    expect(json.meta.total_count).toBe(1)
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: returns mock response for single Person by ID', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people/123')
    const json = (yield* response.json) as {
      data: { type: string; id: string; attributes: Record<string, unknown> }
      included: Array<unknown>
    }

    expect(json.data.type).toBe('Person')
    expect(json.data.id).toBe('123')
    expect(json.data.attributes).toEqual({})
    expect(json.included).toEqual([])
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: returns mock response for Address collection', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get('https://api.planningcenteronline.com/people/v2/addresses')
    const json = (yield* response.json) as {
      data: Array<{ type: string; id: string; attributes: Record<string, unknown> }>
    }

    expect(json.data).toHaveLength(1)
    const firstAddress = json.data[0]
    if (!firstAddress) {
      throw new Error('Expected first address to exist')
    }
    expect(firstAddress.type).toBe('Address')
    expect(firstAddress.id).toBe('1')
    expect(firstAddress.attributes).toEqual({})
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: returns mock response for Campus by ID', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get(
      'https://api.planningcenteronline.com/people/v2/campuses/456',
    )
    const json = (yield* response.json) as {
      data: { type: string; id: string; attributes: Record<string, unknown> }
    }

    expect(json.data.type).toBe('Campus')
    expect(json.data.id).toBe('456')
    expect(json.data.attributes).toEqual({})
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: returns mock response for PhoneNumber collection', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get(
      'https://api.planningcenteronline.com/people/v2/phone_numbers',
    )
    const json = (yield* response.json) as {
      data: Array<{ type: string; attributes: Record<string, unknown> }>
      meta: { count: number }
    }

    expect(json.data).toHaveLength(1)
    const firstPhone = json.data[0]
    if (!firstPhone) {
      throw new Error('Expected first phone to exist')
    }
    expect(firstPhone.type).toBe('PhoneNumber')
    expect(firstPhone.attributes).toEqual({})
    expect(json.meta.count).toBe(1)
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: returns mock response for Group by ID', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get('https://api.planningcenteronline.com/groups/v2/groups/789')
    const json = (yield* response.json) as {
      data: { type: string; id: string; attributes: Record<string, unknown> }
    }

    expect(json.data.type).toBe('Group')
    expect(json.data.id).toBe('789')
    expect(json.data.attributes).toEqual({})
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: handles webhook subscriptions endpoint', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get(
      'https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions',
    )
    const json = (yield* response.json) as {
      data: Array<{ type: string }>
    }

    expect(json.data).toHaveLength(1)
    const firstWebhook = json.data[0]
    if (!firstWebhook) {
      throw new Error('Expected first webhook to exist')
    }
    expect(firstWebhook.type).toBe('WebhookSubscription')
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: provides correct collection structure (fallback)', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    // Use a path that's NOT in responseLookup to test fallback behavior
    const response = yield* client.get('https://api.planningcenteronline.com/people/v2/field_data')
    const json = (yield* response.json) as {
      data: Array<unknown>
      included: Array<unknown>
      links: { self: string }
      meta: { can_include: Array<unknown> }
    }

    expect(json.data).toBeDefined()
    expect(json.included).toEqual([])
    expect(json.links).toBeDefined()
    expect(json.links.self).toBe('https://api.planningcenteronline.com/mock')
    expect(json.meta).toBeDefined()
    expect(json.meta.can_include).toEqual([])
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: provides correct single entity structure', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people/1')
    const json = (yield* response.json) as {
      data: unknown
      included: Array<unknown>
      links?: unknown
      meta?: unknown
    }

    expect(json.data).toBeDefined()
    expect(json.included).toEqual([])
    expect(json.links).toBeUndefined()
    expect(json.meta).toBeUndefined()
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: uses responseLookup for /people/v2/people', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people')
    const json = (yield* response.json) as {
      data: Array<{
        type: string
        id: string
        attributes: { first_name: string; last_name: string }
      }>
      included: Array<{ type: string; id: string }>
      meta: { count: number; total_count: number }
    }

    // Should return the mock data from responseLookup, not the empty fallback
    expect(json.data).toHaveLength(1)
    const firstPerson = json.data[0]
    if (!firstPerson) {
      throw new Error('Expected first person to exist')
    }
    expect(firstPerson.type).toBe('Person')
    expect(firstPerson.id).toBe('160290623')
    expect(firstPerson.attributes.first_name).toBe('Peter')
    expect(firstPerson.attributes.last_name).toBe('Pogenpoel')

    // Should have included data
    expect(json.included.length).toBeGreaterThan(0)

    // Check for Email, Address, and PhoneNumber in included
    const includedTypes = json.included.map((item) => item.type)
    expect(includedTypes).toContain('Email')
    expect(includedTypes).toContain('Address')
    expect(includedTypes).toContain('PhoneNumber')

    // Should have proper meta
    expect(json.meta.count).toBe(1)
    expect(json.meta.total_count).toBe(1)
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)

effect('MockPcoHttpClient: uses responseLookup for services/v2/teams', () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get('https://api.planningcenteronline.com/services/v2/teams')
    const json = (yield* response.json) as {
      data: Array<{
        type: string
        id: string
        attributes: { name: string }
      }>
      included: Array<{ type: string; id: string }>
      meta: { count: number; total_count: number }
    }

    // Should return the mock data from responseLookup
    expect(json.data).toHaveLength(1)
    const firstTeam = json.data[0]
    if (!firstTeam) {
      throw new Error('Expected first team to exist')
    }
    expect(firstTeam.type).toBe('Team')
    expect(firstTeam.id).toBe('4056636')
    expect(firstTeam.attributes.name).toBe('Audio/Visual')

    // Should have included People data
    expect(json.included.length).toBeGreaterThan(0)
    const includedTypes = json.included.map((item) => item.type)
    expect(includedTypes).toContain('Person')

    // Should have proper meta
    expect(json.meta.count).toBe(1)
    expect(json.meta.total_count).toBe(42)
  }).pipe(Effect.provide(MockPcoHttpClientLayer)),
)
