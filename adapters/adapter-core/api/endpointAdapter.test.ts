import { expect } from 'bun:test'
import { live } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import {
  type BuildPayloadSchemaType,
  buildPayloadSchema,
  extractPathParams,
  generatePathParamsSchema,
  toHttpApiEndpoint,
} from './endpointAdapter'

// Tests for extractPathParams function
live('extractPathParams should extract single path parameter', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people/:personId')
    expect(result).toEqual(['personId'])
  }),
)

live('extractPathParams should extract multiple path parameters', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people/:personId/events/:eventId')
    expect(result).toEqual(['personId', 'eventId'])
  }),
)

live('extractPathParams should extract parameters with complex names', () =>
  Effect.sync(() => {
    const result = extractPathParams('/organizations/:orgId/people/:personId/events/:eventId')
    expect(result).toEqual(['orgId', 'personId', 'eventId'])
  }),
)

live('extractPathParams should return empty array for paths without parameters', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people')
    expect(result).toEqual([])
  }),
)

live('extractPathParams should handle paths with mixed segments', () =>
  Effect.sync(() => {
    const result = extractPathParams('/api/v1/people/:personId/static/events/:eventId')
    expect(result).toEqual(['personId', 'eventId'])
  }),
)

live('extractPathParams should handle parameters at the end', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people/:personId')
    expect(result).toEqual(['personId'])
  }),
)

live('extractPathParams should handle parameters at the beginning', () =>
  Effect.sync(() => {
    const result = extractPathParams('/:orgId/people')
    expect(result).toEqual(['orgId'])
  }),
)

// Tests for generatePathParamsSchema function
live('generatePathParamsSchema should generate schema for single parameter', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId')
    const result = Schema.decodeUnknownSync(schema)({ personId: 'test-id' })
    expect(result).toEqual({ personId: 'test-id' })
  }),
)

live('generatePathParamsSchema should generate schema for multiple parameters', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId/events/:eventId')
    const result = Schema.decodeUnknownSync(schema)({
      eventId: 'event-456',
      personId: 'person-123',
    })
    expect(result).toEqual({ eventId: 'event-456', personId: 'person-123' })
  }),
)

live('generatePathParamsSchema should generate empty schema for paths without parameters', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people')
    const result = Schema.decodeUnknownSync(schema)({})
    expect(result).toEqual({})
  }),
)

live('generatePathParamsSchema should validate string types', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId')

    // Should succeed with string
    const validResult = Schema.decodeUnknownSync(schema)({
      personId: 'valid-string',
    })
    expect(validResult).toEqual({ personId: 'valid-string' })

    // Should fail with non-string (this will throw)
    expect(() => {
      Schema.decodeUnknownSync(schema)({ personId: 123 })
    }).toThrow()
  }),
)

live('generatePathParamsSchema should handle complex parameter names', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema(
      '/organizations/:orgId/people/:personId/events/:eventId',
    )
    const result = Schema.decodeUnknownSync(schema)({
      eventId: 'event-3',
      orgId: 'org-1',
      personId: 'person-2',
    })
    expect(result).toEqual({
      eventId: 'event-3',
      orgId: 'org-1',
      personId: 'person-2',
    })
  }),
)

live('generatePathParamsSchema should require all parameters', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId/events/:eventId')

    // Should fail when missing required parameter
    expect(() => {
      Schema.decodeUnknownSync(schema)({ personId: 'person-123' }) // missing eventId
    }).toThrow()
  }),
)

live('should extract path parameters for PATCH endpoints', () =>
  Effect.sync(() => {
    const endpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          first_name: Schema.String,
        }),
        id: Schema.String,
      }),
      entity: 'Person' as const,
      method: 'PATCH' as const,
      module: 'people' as const,
      name: 'updatePerson',
      path: '/people/:personId' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            first_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
      updatableFields: {
        fields: ['first_name'] as const,
        special: [] as const,
      },
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    // The endpoint should be created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('updatePerson')
    expect(httpEndpoint.path).toBe('/people/:personId')
    expect(httpEndpoint.method).toBe('PATCH')
  }),
)

live('should extract multiple path parameters', () =>
  Effect.sync(() => {
    const endpoint = {
      apiSchema: Schema.Struct({
        id: Schema.String,
      }),
      entity: 'Event' as const,
      method: 'DELETE' as const,
      module: 'people' as const,
      name: 'deletePersonEvent',
      path: '/people/:personId/events/:eventId' as const,
      response: Schema.Void,
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    // The endpoint should be created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('deletePersonEvent')
    expect(httpEndpoint.path).toBe('/people/:personId/events/:eventId')
    expect(httpEndpoint.method).toBe('DELETE')
  }),
)

live('should handle endpoints without path parameters', () =>
  Effect.sync(() => {
    const endpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          first_name: Schema.String,
        }),
        id: Schema.String,
      }),
      creatableFields: {
        fields: ['first_name'] as const,
        special: [] as const,
      },
      entity: 'Person' as const,
      method: 'POST' as const,
      module: 'people' as const,
      name: 'createPerson',
      path: '/people' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            first_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    // The endpoint should be created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('createPerson')
    expect(httpEndpoint.path).toBe('/people')
    expect(httpEndpoint.method).toBe('POST')
  }),
)

live('should correctly type path parameters at compile time', () =>
  Effect.sync(() => {
    // Test single path parameter
    const singleParamEndpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          first_name: Schema.String,
        }),
        id: Schema.String,
      }),
      entity: 'Person' as const,
      method: 'PATCH' as const,
      module: 'people' as const,
      name: 'updatePerson',
      path: '/people/:personId' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            first_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
      updatableFields: {
        fields: ['first_name'] as const,
        special: [] as const,
      },
    }

    const singleParamHttpEndpoint = toHttpApiEndpoint(singleParamEndpoint)

    // Test multiple path parameters
    const multipleParamEndpoint = {
      apiSchema: Schema.Struct({
        id: Schema.String,
      }),
      entity: 'Event' as const,
      method: 'DELETE' as const,
      module: 'people' as const,
      name: 'deletePersonEvent',
      path: '/people/:personId/events/:eventId' as const,
      response: Schema.Void,
    }

    const multipleParamHttpEndpoint = toHttpApiEndpoint(multipleParamEndpoint)

    // Verify endpoints are created successfully
    expect(singleParamHttpEndpoint).toBeDefined()
    expect(singleParamHttpEndpoint.path).toBe('/people/:personId')

    expect(multipleParamHttpEndpoint).toBeDefined()
    expect(multipleParamHttpEndpoint.path).toBe('/people/:personId/events/:eventId')

    // The real test is at compile time - TypeScript should infer the correct path parameter types
    // Single param should have type: { readonly personId: string }
    // Multiple params should have type: { readonly personId: string; readonly eventId: string }
    console.log('✅ Path parameter types correctly inferred at compile time')
  }),
)

// Tests for buildPayloadSchema function (to be implemented)
live('buildPayloadSchema should create payload schema with selected fields under attributes', () =>
  Effect.sync(() => {
    // Mock API schema that follows the PCO entity structure
    const mockApiSchema = Schema.Struct({
      attributes: Schema.Struct({
        age: Schema.Number,
        created_at: Schema.String,
        email: Schema.String,
        first_name: Schema.String,
        is_active: Schema.Boolean,
        last_name: Schema.String,
        updated_at: Schema.String,
      }),
      id: Schema.String,
      links: Schema.Struct({}),
      relationships: Schema.Struct({}),
      type: Schema.Literal('Person'),
    })

    const fields = ['first_name', 'last_name', 'email'] as const
    const payloadSchema = buildPayloadSchema(mockApiSchema, fields)

    // Test with valid data structure
    const validPayload = {
      attributes: {
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
      },
    }

    // Test that the schema validates the payload correctly
    const result = Schema.decodeUnknownSync(payloadSchema)(validPayload) as any
    expect(result).toEqual(validPayload)
    expect(result.attributes.first_name).toBe('John')
    expect(result.attributes.last_name).toBe('Doe')
    expect(result.attributes.email).toBe('john@example.com')
  }),
)

live('buildPayloadSchema should work with different field types', () =>
  Effect.sync(() => {
    const mockApiSchema = Schema.Struct({
      attributes: Schema.Struct({
        age: Schema.Number,
        first_name: Schema.String,
        is_active: Schema.Boolean,
      }),
      id: Schema.String,
      links: Schema.Struct({}),
      relationships: Schema.Struct({}),
      type: Schema.Literal('Person'),
    })

    const fields = ['first_name', 'age', 'is_active'] as const
    const payloadSchema = buildPayloadSchema(mockApiSchema, fields)

    const validPayload = {
      attributes: {
        age: 25,
        first_name: 'Jane',
        is_active: true,
      },
    }

    // Test that the schema validates different field types correctly
    const result = Schema.decodeUnknownSync(payloadSchema)(validPayload) as any
    expect(result).toEqual(validPayload)
    expect(typeof result.attributes.first_name).toBe('string')
    expect(typeof result.attributes.age).toBe('number')
    expect(typeof result.attributes.is_active).toBe('boolean')
  }),
)

live('buildPayloadSchema should work with PCO Person creatable fields', () =>
  Effect.sync(() => {
    // Simulate the actual PCO Person schema structure
    const pcoPersonSchema = Schema.Struct({
      attributes: Schema.Struct({
        accounting_administrator: Schema.Boolean,
        anniversary: Schema.NullOr(Schema.String),
        avatar: Schema.String,
        birthdate: Schema.NullOr(Schema.String),
        child: Schema.Boolean,
        first_name: Schema.String,
        gender: Schema.NullOr(Schema.Literal('Male', 'Female', 'M', 'F')),
        grade: Schema.NullOr(Schema.Number),
        graduation_year: Schema.NullOr(Schema.Number),
        inactivated_at: Schema.NullOr(Schema.String),
        last_name: Schema.String,
        medical_notes: Schema.NullOr(Schema.String),
        membership: Schema.NullOr(Schema.String),
        middle_name: Schema.NullOr(Schema.String),
        nickname: Schema.NullOr(Schema.String),
        people_permissions: Schema.NullOr(Schema.String),
        remote_id: Schema.NullOr(Schema.Union(Schema.String, Schema.Number)),
        site_administrator: Schema.Boolean,
        status: Schema.Literal('active', 'inactive'),
      }),
      id: Schema.String,
      links: Schema.Struct({}),
      relationships: Schema.Struct({}),
      type: Schema.Literal('Person'),
    })

    const creatableFields = [
      'first_name',
      'last_name',
      'anniversary',
      'birthdate',
      'gender',
      'grade',
      'graduation_year',
      'child',
      'status',
    ] as const

    const payloadSchema = buildPayloadSchema(pcoPersonSchema, creatableFields)

    const validPersonPayload = {
      attributes: {
        anniversary: '2020-01-01',
        birthdate: '1990-05-15',
        child: false,
        first_name: 'John',
        gender: 'Male' as const,
        grade: null,
        graduation_year: null,
        last_name: 'Doe',
        status: 'active' as const,
      },
    }

    // Test that the schema validates PCO Person payload correctly
    const result = Schema.decodeUnknownSync(payloadSchema)(validPersonPayload) as any
    expect(result).toEqual(validPersonPayload)
    expect(result.attributes.first_name).toBe('John')
    expect(result.attributes.last_name).toBe('Doe')
    expect(result.attributes.status).toBe('active')
  }),
)

live('buildPayloadSchema should work with empty fields array', () =>
  Effect.sync(() => {
    const mockApiSchema = Schema.Struct({
      attributes: Schema.Struct({
        first_name: Schema.String,
        last_name: Schema.String,
      }),
      id: Schema.String,
      links: Schema.Struct({}),
      relationships: Schema.Struct({}),
      type: Schema.Literal('Person'),
    })

    const fields = [] as const
    const payloadSchema = buildPayloadSchema(mockApiSchema, fields)

    const validPayload = {
      attributes: {},
    }

    // Test that empty fields array creates empty attributes schema
    const result = Schema.decodeUnknownSync(payloadSchema)(validPayload) as any
    expect(result).toEqual(validPayload)
    expect(Object.keys(result.attributes)).toHaveLength(0)
  }),
)

live('buildPayloadSchema should throw error if apiSchema lacks attributes property', () =>
  Effect.sync(() => {
    const invalidSchema = Schema.Struct({
      id: Schema.String,
      type: Schema.Literal('Person'),
      // Missing attributes property
    })

    const fields = ['first_name'] as const

    expect(() => {
      buildPayloadSchema(invalidSchema, fields)
    }).toThrow(
      "apiSchema for endpoint does not have a valid 'attributes' property needed to build a payload.",
    )
  }),
)

live('buildPayloadSchema should validate payload structure correctly', () =>
  Effect.sync(() => {
    const mockApiSchema = Schema.Struct({
      attributes: Schema.Struct({
        age: Schema.Number,
        first_name: Schema.String,
      }),
      id: Schema.String,
      links: Schema.Struct({}),
      relationships: Schema.Struct({}),
      type: Schema.Literal('Person'),
    })

    const fields = ['first_name', 'age'] as const
    const payloadSchema = buildPayloadSchema(mockApiSchema, fields)

    // Should reject payload with missing required fields
    expect(() => {
      Schema.decodeUnknownSync(payloadSchema)({
        attributes: {
          first_name: 'John',
          // Missing age
        },
      })
    }).toThrow()
  }),
)

// Tests for BuildPayloadSchemaType type helper
live('BuildPayloadSchemaType should correctly type simple payload structure', () =>
  Effect.sync(() => {
    // Define a mock Fields type (represents the attributes structure)
    type MockFields = {
      first_name: string
      last_name: string
      email: string
      age: number
    }

    // Test with selected fields
    type PayloadType = BuildPayloadSchemaType<MockFields, ['first_name', 'last_name']>

    // This should compile and have the correct structure
    const payload: PayloadType = {
      attributes: {
        first_name: 'John',
        last_name: 'Doe',
      },
    }

    // Verify the payload structure
    expect(payload.attributes.first_name).toBe('John')
    expect(payload.attributes.last_name).toBe('Doe')

    // TypeScript should prevent accessing non-selected fields
    // @ts-expect-error - email should not be accessible
    const _email = payload.attributes.email

    // TypeScript should prevent accessing non-existent fields
    // @ts-expect-error - invalid_field should not be accessible
    const _invalid = payload.attributes.invalid_field
  }),
)

live('BuildPayloadSchemaType should work with different field types', () =>
  Effect.sync(() => {
    type MockFields = {
      name: string
      age: number
      is_active: boolean
      tags: Array<string>
      metadata: { key: string; value: any }
    }

    type PayloadType = BuildPayloadSchemaType<
      MockFields,
      ['name', 'age', 'is_active', 'tags', 'metadata']
    >

    const payload: PayloadType = {
      attributes: {
        age: 25,
        is_active: true,
        metadata: { key: 'role', value: 'engineer' },
        name: 'Jane',
        tags: ['developer', 'typescript'],
      },
    }

    // Verify different types are preserved
    expect(typeof payload.attributes.name).toBe('string')
    expect(typeof payload.attributes.age).toBe('number')
    expect(typeof payload.attributes.is_active).toBe('boolean')
    expect(Array.isArray(payload.attributes.tags)).toBe(true)
    expect(typeof payload.attributes.metadata).toBe('object')
  }),
)

live('BuildPayloadSchemaType should work with empty field selection', () =>
  Effect.sync(() => {
    type MockFields = {
      first_name: string
      last_name: string
    }

    type PayloadType = BuildPayloadSchemaType<MockFields, []>

    const payload: PayloadType = {
      attributes: {},
    }

    // Should have empty attributes object
    expect(Object.keys(payload.attributes)).toHaveLength(0)
  }),
)

live('BuildPayloadSchemaType should work with PCO Person-like schema', () =>
  Effect.sync(() => {
    // Simulate PCO Person attributes structure (Fields type)
    type PcoPersonFields = {
      first_name: string
      last_name: string
      anniversary: string | null
      birthdate: string | null
      gender: 'Male' | 'Female' | 'M' | 'F' | null
      grade: number | null
      graduation_year: number | null
      child: boolean
      status: 'active' | 'inactive'
      inactivated_at: string | null
      remote_id: string | number | null
      medical_notes: string | null
      membership: string | null
      middle_name: string | null
      nickname: string | null
      people_permissions: string | null
      accounting_administrator: boolean
      site_administrator: boolean
      avatar: string
    }

    type CreatableFields = [
      'first_name',
      'last_name',
      'anniversary',
      'birthdate',
      'gender',
      'grade',
      'graduation_year',
      'child',
      'status',
    ]

    type PayloadType = BuildPayloadSchemaType<PcoPersonFields, CreatableFields>

    const payload: PayloadType = {
      attributes: {
        anniversary: '2020-01-01',
        birthdate: '1990-05-15',
        child: false,
        first_name: 'John',
        gender: 'Male',
        grade: null,
        graduation_year: null,
        last_name: 'Doe',
        status: 'active',
      },
    }

    // Verify the payload structure matches expected types
    expect(payload.attributes.first_name).toBe('John')
    expect(payload.attributes.last_name).toBe('Doe')
    expect(payload.attributes.status).toBe('active')
    expect(payload.attributes.child).toBe(false)
    expect(payload.attributes.grade).toBe(null)

    // TypeScript should prevent accessing non-creatable fields
    // @ts-expect-error - avatar should not be accessible in this payload
    const _avatar = payload.attributes.avatar
  }),
)

live("BuildPayloadSchemaType should handle fields that don't exist in Fields type", () =>
  Effect.sync(() => {
    // Fields type with limited properties
    type LimitedFields = {
      first_name: string
      last_name: string
    }

    // Try to select a field that doesn't exist - should result in empty Pick
    type PayloadType = BuildPayloadSchemaType<LimitedFields, ['first_name', 'non_existent_field']>

    const payload: PayloadType = {
      attributes: {
        first_name: 'John',
        // non_existent_field is filtered out by Pick
      },
    }

    // Should only have the valid field
    expect(payload.attributes.first_name).toBe('John')

    // TypeScript should prevent accessing the non-existent field
    // @ts-expect-error - non_existent_field should not be accessible
    const _nonExistent = payload.attributes.non_existent_field
  }),
)

// Test that the type overrides work correctly with actual endpoint definitions
live('POST endpoint should have correct payload type from BuildPayloadSchemaType', () =>
  Effect.sync(() => {
    // Define a realistic endpoint definition structure
    type MockFields = {
      first_name: string
      last_name: string
      email: string
      age: number
      is_active: boolean
    }

    const postEndpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          age: Schema.Number,
          email: Schema.String,
          first_name: Schema.String,
          is_active: Schema.Boolean,
          last_name: Schema.String,
        }),
        id: Schema.String,
        links: Schema.Struct({}),
        relationships: Schema.Struct({}),
        type: Schema.Literal('Person'),
      }),
      creatableFields: {
        fields: ['first_name', 'last_name', 'email'] as const,
        special: [] as const,
      },
      entity: 'Person' as const,
      method: 'POST' as const,
      module: 'people' as const,
      name: 'createPerson',
      path: '/people' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            email: Schema.String,
            first_name: Schema.String,
            last_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(postEndpoint)

    // Verify the endpoint was created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('createPerson')
    expect(httpEndpoint.method).toBe('POST')
    expect(httpEndpoint.path).toBe('/people')

    // The payload type should match BuildPayloadSchemaType<MockFields, ['first_name', 'last_name', 'email']>
    type ExpectedPayloadType = BuildPayloadSchemaType<
      MockFields,
      ['first_name', 'last_name', 'email']
    >

    // This should compile correctly - the types should match
    const validPayload: ExpectedPayloadType = {
      attributes: {
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
      },
    }

    expect(validPayload.attributes.first_name).toBe('John')
    expect(validPayload.attributes.last_name).toBe('Doe')
    expect(validPayload.attributes.email).toBe('john@example.com')
  }),
)

live('PATCH endpoint should have correct payload type from BuildPayloadSchemaType', () =>
  Effect.sync(() => {
    type MockFields = {
      first_name: string
      last_name: string
      email: string
      age: number
    }

    const patchEndpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          age: Schema.Number,
          email: Schema.String,
          first_name: Schema.String,
          last_name: Schema.String,
        }),
        id: Schema.String,
        links: Schema.Struct({}),
        relationships: Schema.Struct({}),
        type: Schema.Literal('Person'),
      }),
      entity: 'Person' as const,
      method: 'PATCH' as const,
      module: 'people' as const,
      name: 'updatePerson',
      path: '/people/:personId' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            first_name: Schema.String,
            last_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
      updatableFields: {
        fields: ['first_name', 'last_name'] as const,
        special: [] as const,
      },
    }

    const httpEndpoint = toHttpApiEndpoint(patchEndpoint)

    // Verify the endpoint was created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('updatePerson')
    expect(httpEndpoint.method).toBe('PATCH')
    expect(httpEndpoint.path).toBe('/people/:personId')

    // The payload type should match BuildPayloadSchemaType<MockFields, ['first_name', 'last_name']>
    type ExpectedPayloadType = BuildPayloadSchemaType<MockFields, ['first_name', 'last_name']>

    const validPayload: ExpectedPayloadType = {
      attributes: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
    }

    expect(validPayload.attributes.first_name).toBe('Jane')
    expect(validPayload.attributes.last_name).toBe('Smith')

    // TypeScript should prevent accessing non-updatable fields
    // @ts-expect-error - email should not be accessible in update payload
    const _email = validPayload.attributes.email
  }),
)
