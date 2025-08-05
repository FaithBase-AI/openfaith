import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { PcoCampus, pcoCampusTransformer } from './pcoCampusSchema'

effect('PcoCampus transformation: transforms PCO campus to BaseCampus with custom fields', () =>
  Effect.gen(function* () {
    const pcoCampusData = {
      avatar_url: 'https://example.com/avatar.jpg',
      church_center_enabled: true,
      city: 'Austin',
      contact_email_address: 'contact@example.com',
      country: 'USA',
      created_at: '2024-01-01T00:00:00Z',
      date_format: 0,
      description: 'Main campus',
      geolocation_set_manually: false,
      latitude: '30.2672',
      longitude: '-97.7431',
      name: 'Main Campus',
      phone_number: '555-1234',
      state: 'TX',
      street: '123 Main St',
      time_zone: 'America/Chicago',
      time_zone_raw: 'CST',
      twenty_four_hour_time: false,
      updated_at: '2024-01-02T00:00:00Z',
      website: 'https://example.com',
      zip: '78701',
    }

    const result = Schema.decodeSync(pcoCampusTransformer)(pcoCampusData)

    // Check that regular fields are mapped correctly
    expect(result.avatar).toBe('https://example.com/avatar.jpg')
    expect(result.city).toBe('Austin')
    expect(result.country).toBe('USA')
    expect(result.description).toBe('Main campus')
    expect(result.latitude).toBe(30.2672) // Should be converted to number
    expect(result.longitude).toBe(-97.7431) // Should be converted to number
    expect(result.name).toBe('Main Campus')
    expect(result.state).toBe('TX')
    expect(result.street).toBe('123 Main St')
    expect(result.url).toBe('https://example.com')
    expect(result.zip).toBe('78701')
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z')
    expect(result.updatedAt).toBe('2024-01-02T00:00:00Z')

    // Check that custom fields are collected
    expect(result.customFields).toBeDefined()
    expect(Array.isArray(result.customFields)).toBe(true)

    // Find custom fields in the array - use 'name' not 'key'
    const customFieldMap = new Map(
      result.customFields.map((field: any) => [field.name, field.value]),
    )

    // Custom fields are prefixed with 'pco_' and use the original PCO field names
    expect(customFieldMap.get('pco_church_center_enabled')).toBe(true)
    expect(customFieldMap.get('pco_contact_email_address')).toBe('contact@example.com')
    expect(customFieldMap.get('pco_date_format')).toBe(0)
    expect(customFieldMap.get('pco_geolocation_set_manually')).toBe(false)
    expect(customFieldMap.get('pco_phone_number')).toBe('555-1234')
    expect(customFieldMap.get('pco_time_zone')).toBe('America/Chicago')
    // time_zone_raw is optional and may not be included
    if (customFieldMap.has('pco_time_zone_raw')) {
      expect(customFieldMap.get('pco_time_zone_raw')).toBe('CST')
    }
    expect(customFieldMap.get('pco_twenty_four_hour_time')).toBe(false)
  }),
)

effect('PcoCampus transformation: handles null values correctly', () =>
  Effect.gen(function* () {
    const pcoCampusData = {
      avatar_url: null,
      church_center_enabled: false,
      city: null,
      contact_email_address: null,
      country: null,
      created_at: '2024-01-01T00:00:00Z',
      date_format: null,
      description: null,
      geolocation_set_manually: false,
      latitude: null,
      longitude: null,
      name: 'Test Campus',
      phone_number: null,
      state: null,
      street: null,
      time_zone: null,
      twenty_four_hour_time: null,
      updated_at: '2024-01-02T00:00:00Z',
      website: null,
      zip: null,
    }

    const result = Schema.decodeSync(pcoCampusTransformer)(pcoCampusData)

    expect(result.avatar).toBeNull()
    expect(result.city).toBeNull()
    expect(result.country).toBeNull()
    expect(result.description).toBeNull()
    expect(result.latitude).toBeNull()
    expect(result.longitude).toBeNull()
    expect(result.name).toBe('Test Campus')
    expect(result.state).toBeNull()
    expect(result.street).toBeNull()
    expect(result.url).toBeNull()
    expect(result.zip).toBeNull()
  }),
)

effect('PcoCampus schema structure is valid', () =>
  Effect.gen(function* () {
    const sampleData = {
      attributes: {
        avatar_url: 'https://example.com/avatar.jpg',
        church_center_enabled: true,
        city: 'Austin',
        contact_email_address: 'contact@example.com',
        country: 'USA',
        created_at: '2024-01-01T00:00:00Z',
        date_format: 1,
        description: 'Main campus',
        geolocation_set_manually: false,
        latitude: '30.2672',
        longitude: '-97.7431',
        name: 'Main Campus',
        phone_number: '555-1234',
        state: 'TX',
        street: '123 Main St',
        time_zone: 'America/Chicago',
        time_zone_raw: 'CST',
        twenty_four_hour_time: false,
        updated_at: '2024-01-02T00:00:00Z',
        website: 'https://example.com',
        zip: '78701',
      },
      id: '123',
      links: {
        self: 'https://api.planningcenteronline.com/people/v2/campuses/123',
      },
      relationships: {
        organization: {
          data: {
            id: 'org123',
            type: 'Organization' as const,
          },
        },
      },
      type: 'Campus' as const,
    }

    const result = Schema.decodeSync(PcoCampus)(sampleData)
    expect(result.id).toBe('123')
    expect(result.type).toBe('Campus')
    expect(result.attributes.name).toBe('Main Campus')
  }),
)
