import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { PcoPerson, pcoPersonTransformer } from '@openfaith/pco/modules/people/pcoPersonSchema'
import { Effect, Schema } from 'effect'

effect('PcoPerson transformation: transforms PCO person to BasePerson with custom fields', () =>
  Effect.gen(function* () {
    const pcoPersonData = {
      accounting_administrator: false,
      anniversary: '2020-05-15',
      avatar: 'https://example.com/avatar.jpg',
      birthdate: '1990-01-01',
      child: false,
      created_at: '2023-01-01T00:00:00Z',
      demographic_avatar_url: 'https://example.com/demo.jpg',
      first_name: 'John',
      gender: 'Male' as const,
      given_name: 'Jonathan',
      grade: 12 as const,
      graduation_year: 2024,
      inactivated_at: null,
      last_name: 'Doe',
      medical_notes: 'No allergies',
      membership: 'Member',
      middle_name: 'William',
      name: 'John William Doe',
      nickname: 'Johnny',
      passed_background_check: true,
      people_permissions: 'Editor' as const,
      remote_id: '12345',
      school_type: 'Public',
      site_administrator: false,
      status: 'active' as const,
      updated_at: '2023-12-01T00:00:00Z',
    }

    const result = Schema.decodeSync(pcoPersonTransformer)(pcoPersonData)

    // Check that regular fields are mapped correctly
    expect(result.firstName).toBe('John')
    expect(result.lastName).toBe('Doe')
    expect(result.middleName).toBe('William')
    expect(result.name).toBe('John William Doe')
    expect(result.birthdate).toBe('1990-01-01')
    expect(result.anniversary).toBe('2020-05-15')
    expect(result.avatar).toBe('https://example.com/avatar.jpg')
    expect(result.gender).toBe('male')
    expect(result.status).toBe('active')
    expect(result.membership).toBe('Member')
    expect(result.inactivatedAt).toBeNull()
    expect(result.createdAt).toBe('2023-01-01T00:00:00Z')
    expect(result.updatedAt).toBe('2023-12-01T00:00:00Z')

    // Check that custom fields are collected
    expect(result.customFields).toBeDefined()
    expect(Array.isArray(result.customFields)).toBe(true)

    // Find custom fields in the array
    const customFieldMap = new Map(
      result.customFields.map((field: any) => [field.name, field.value]),
    )

    // Custom fields are prefixed with 'pco_' and use the original PCO field names
    expect(customFieldMap.get('pco_accounting_administrator')).toBe(false)
    expect(customFieldMap.get('pco_child')).toBe(false)
    expect(customFieldMap.get('pco_demographic_avatar_url')).toBe('https://example.com/demo.jpg')
    expect(customFieldMap.get('pco_given_name')).toBe('Jonathan')
    expect(customFieldMap.get('pco_grade')).toBe(12)
    expect(customFieldMap.get('pco_graduation_year')).toBe(2024)
    expect(customFieldMap.get('pco_medical_notes')).toBe('No allergies')
    expect(customFieldMap.get('pco_nickname')).toBe('Johnny')
    expect(customFieldMap.get('pco_passed_background_check')).toBe(true)
    expect(customFieldMap.get('pco_people_permissions')).toBe('Editor')
    expect(customFieldMap.get('pco_remote_id')).toBe('12345')
    expect(customFieldMap.get('pco_school_type')).toBe('Public')
    expect(customFieldMap.get('pco_site_administrator')).toBe(false)
  }),
)

effect('PcoPerson transformation: handles null values correctly', () =>
  Effect.gen(function* () {
    const pcoPersonData = {
      accounting_administrator: false,
      anniversary: null,
      avatar: 'https://example.com/avatar.jpg',
      birthdate: null,
      child: false,
      created_at: '2023-01-01T00:00:00Z',
      demographic_avatar_url: 'https://example.com/demo.jpg',
      first_name: 'Jane',
      gender: null,
      given_name: null,
      grade: null,
      graduation_year: null,
      inactivated_at: null,
      last_name: 'Smith',
      medical_notes: null,
      membership: null,
      middle_name: null,
      name: 'Jane Smith',
      nickname: null,
      passed_background_check: false,
      people_permissions: null,
      remote_id: null,
      school_type: null,
      site_administrator: false,
      status: 'active' as const,
      updated_at: '2023-12-01T00:00:00Z',
    }

    const result = Schema.decodeSync(pcoPersonTransformer)(pcoPersonData)

    expect(result.firstName).toBe('Jane')
    expect(result.lastName).toBe('Smith')
    expect(result.middleName).toBeNull()
    expect(result.birthdate).toBeNull()
    expect(result.anniversary).toBeNull()
    expect(result.gender).toBeNull()
    expect(result.membership).toBeNull()
    expect(result.inactivatedAt).toBeNull()

    // Check that null custom fields are handled
    const customFieldMap = new Map(
      result.customFields.map((field: any) => [field.name, field.value]),
    )

    expect(customFieldMap.get('pco_given_name')).toBeNull()
    expect(customFieldMap.get('pco_grade')).toBeNull()
    expect(customFieldMap.get('pco_graduation_year')).toBeNull()
    expect(customFieldMap.get('pco_medical_notes')).toBeNull()
    expect(customFieldMap.get('pco_nickname')).toBeNull()
    expect(customFieldMap.get('pco_people_permissions')).toBeNull()
    expect(customFieldMap.get('pco_remote_id')).toBeNull()
    expect(customFieldMap.get('pco_school_type')).toBeNull()
  }),
)

effect('PcoPerson schema structure is valid', () =>
  Effect.gen(function* () {
    const sampleData = {
      attributes: {
        accounting_administrator: true,
        anniversary: '2020-05-15',
        avatar: 'https://example.com/avatar.jpg',
        birthdate: '1990-01-01',
        child: false,
        created_at: '2023-01-01T00:00:00Z',
        demographic_avatar_url: 'https://example.com/demo.jpg',
        first_name: 'John',
        gender: 'Male' as const,
        given_name: 'Jonathan',
        grade: 12 as const,
        graduation_year: 2024,
        inactivated_at: null,
        last_name: 'Doe',
        medical_notes: 'No allergies',
        membership: 'Member',
        middle_name: 'William',
        name: 'John William Doe',
        nickname: 'Johnny',
        passed_background_check: true,
        people_permissions: 'Manager' as const,
        remote_id: '12345',
        school_type: 'Public',
        site_administrator: true,
        status: 'active' as const,
        updated_at: '2023-12-01T00:00:00Z',
      },
      id: '456',
      links: {
        addresses: 'https://api.planningcenteronline.com/people/v2/people/456/addresses',
        apps: 'https://api.planningcenteronline.com/people/v2/people/456/apps',
        connected_people:
          'https://api.planningcenteronline.com/people/v2/people/456/connected_people',
        emails: 'https://api.planningcenteronline.com/people/v2/people/456/emails',
        field_data: 'https://api.planningcenteronline.com/people/v2/people/456/field_data',
        household_memberships:
          'https://api.planningcenteronline.com/people/v2/people/456/household_memberships',
        households: 'https://api.planningcenteronline.com/people/v2/people/456/households',
        html: 'https://people.planningcenteronline.com/people/456',
        inactive_reason: null,
        message_groups: 'https://api.planningcenteronline.com/people/v2/people/456/message_groups',
        messages: 'https://api.planningcenteronline.com/people/v2/people/456/messages',
        notes: 'https://api.planningcenteronline.com/people/v2/people/456/notes',
        organization: 'https://api.planningcenteronline.com/people/v2/organization',
        person_apps: 'https://api.planningcenteronline.com/people/v2/people/456/person_apps',
        phone_numbers: 'https://api.planningcenteronline.com/people/v2/people/456/phone_numbers',
        platform_notifications:
          'https://api.planningcenteronline.com/people/v2/people/456/platform_notifications',
        self: 'https://api.planningcenteronline.com/people/v2/people/456',
        social_profiles:
          'https://api.planningcenteronline.com/people/v2/people/456/social_profiles',
        workflow_cards: 'https://api.planningcenteronline.com/people/v2/people/456/workflow_cards',
      },
      relationships: {
        primary_campus: {
          data: {
            id: 'campus123',
            type: 'PrimaryCampus' as const,
          },
        },
      },
      type: 'Person' as const,
    }

    const result = Schema.decodeSync(PcoPerson)(sampleData)
    expect(result.id).toBe('456')
    expect(result.type).toBe('Person')
    expect(result.attributes.first_name).toBe('John')
    expect(result.attributes.last_name).toBe('Doe')
    expect(result.attributes.status).toBe('active')
    expect(result.relationships.primary_campus.data?.id).toBe('campus123')
  }),
)

effect('PcoPerson transformation: handles gender variations correctly', () =>
  Effect.gen(function* () {
    // Test with 'M' gender value
    const pcoPersonDataM = {
      accounting_administrator: false,
      anniversary: null,
      avatar: 'https://example.com/avatar.jpg',
      birthdate: null,
      child: false,
      created_at: '2023-01-01T00:00:00Z',
      demographic_avatar_url: 'https://example.com/demo.jpg',
      first_name: 'Alex',
      gender: 'M' as const,
      given_name: null,
      grade: null,
      graduation_year: null,
      inactivated_at: null,
      last_name: 'Johnson',
      medical_notes: null,
      membership: null,
      middle_name: null,
      name: 'Alex Johnson',
      nickname: null,
      passed_background_check: false,
      people_permissions: null,
      remote_id: null,
      school_type: null,
      site_administrator: false,
      status: 'active' as const,
      updated_at: '2023-12-01T00:00:00Z',
    }

    const resultM = Schema.decodeSync(pcoPersonTransformer)(pcoPersonDataM)
    expect(resultM.gender).toBe('male')

    // Test with 'F' gender value
    const pcoPersonDataF = { ...pcoPersonDataM, gender: 'F' as const }
    const resultF = Schema.decodeSync(pcoPersonTransformer)(pcoPersonDataF)
    expect(resultF.gender).toBe('female')

    // Test with 'Female' gender value
    const pcoPersonDataFemale = { ...pcoPersonDataM, gender: 'Female' as const }
    const resultFemale = Schema.decodeSync(pcoPersonTransformer)(pcoPersonDataFemale)
    expect(resultFemale.gender).toBe('female')
  }),
)

effect('PcoPerson transformation: handles inactive status correctly', () =>
  Effect.gen(function* () {
    const pcoPersonData = {
      accounting_administrator: false,
      anniversary: null,
      avatar: 'https://example.com/avatar.jpg',
      birthdate: null,
      child: false,
      created_at: '2023-01-01T00:00:00Z',
      demographic_avatar_url: 'https://example.com/demo.jpg',
      first_name: 'Inactive',
      gender: null,
      given_name: null,
      grade: null,
      graduation_year: null,
      inactivated_at: '2023-06-01T00:00:00Z',
      last_name: 'User',
      medical_notes: null,
      membership: null,
      middle_name: null,
      name: 'Inactive User',
      nickname: null,
      passed_background_check: false,
      people_permissions: null,
      remote_id: null,
      school_type: null,
      site_administrator: false,
      status: 'inactive' as const,
      updated_at: '2023-12-01T00:00:00Z',
    }

    const result = Schema.decodeSync(pcoPersonTransformer)(pcoPersonData)
    expect(result.status).toBe('inactive')
    expect(result.inactivatedAt).toBe('2023-06-01T00:00:00Z')
  }),
)

effect('PcoPerson transformation: handles string remote_id correctly', () =>
  Effect.gen(function* () {
    // Test with string remote_id
    const pcoPersonDataString = {
      accounting_administrator: false,
      anniversary: null,
      avatar: 'https://example.com/avatar.jpg',
      birthdate: null,
      child: false,
      created_at: '2023-01-01T00:00:00Z',
      demographic_avatar_url: 'https://example.com/demo.jpg',
      first_name: 'Test',
      gender: null,
      given_name: null,
      grade: null,
      graduation_year: null,
      inactivated_at: null,
      last_name: 'User',
      medical_notes: null,
      membership: null,
      middle_name: null,
      name: 'Test User',
      nickname: null,
      passed_background_check: false,
      people_permissions: null,
      remote_id: 'ABC123',
      school_type: null,
      site_administrator: false,
      status: 'active' as const,
      updated_at: '2023-12-01T00:00:00Z',
    }

    const resultString = Schema.decodeSync(pcoPersonTransformer)(pcoPersonDataString)
    const customFieldMapString = new Map(
      resultString.customFields.map((field: any) => [field.name, field.value]),
    )
    expect(customFieldMapString.get('pco_remote_id')).toBe('ABC123')

    // Test with number remote_id converted to string
    const pcoPersonDataNumber = { ...pcoPersonDataString, remote_id: '789' }
    const resultNumber = Schema.decodeSync(pcoPersonTransformer)(pcoPersonDataNumber)
    const customFieldMapNumber = new Map(
      resultNumber.customFields.map((field: any) => [field.name, field.value]),
    )
    expect(customFieldMapNumber.get('pco_remote_id')).toBe('789')
  }),
)
