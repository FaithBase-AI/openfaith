import { expect } from 'bun:test'
import {
  type BuildPayloadSchemaType,
  type ExtractPathParams,
  extractPathParams,
  generatePathParamsSchema,
  toHttpApiEndpoint,
} from '@openfaith/adapter-core/api/endpointAdapter'
import { live } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'

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

live('extractPathParams should return empty array for paths without parameters', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people')
    expect(result).toEqual([])
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

// Tests for ExtractPathParams type helper
live('ExtractPathParams should extract single path parameter type', () =>
  Effect.sync(() => {
    // Test single parameter extraction
    type SingleParam = ExtractPathParams<'/people/:personId'>

    // This should compile with the correct type
    const singleParamObj: SingleParam = { personId: 'test-id' }
    expect(singleParamObj.personId).toBe('test-id')

    // TypeScript should prevent accessing non-existent parameters
    // @ts-expect-error - eventId should not exist in single param type
    const _nonExistent = singleParamObj.eventId
  }),
)

live('ExtractPathParams should extract multiple path parameters type', () =>
  Effect.sync(() => {
    // Test multiple parameter extraction
    type MultipleParams = ExtractPathParams<'/people/:personId/events/:eventId'>

    // This should compile with both parameters
    const multipleParamsObj: MultipleParams = {
      eventId: 'event-456',
      personId: 'person-123',
    }
    expect(multipleParamsObj.personId).toBe('person-123')
    expect(multipleParamsObj.eventId).toBe('event-456')

    // TypeScript should prevent accessing non-existent parameters
    // @ts-expect-error - groupId should not exist
    const _nonExistent = multipleParamsObj.groupId
  }),
)

live('ExtractPathParams should handle complex nested paths', () =>
  Effect.sync(() => {
    // Test complex path with multiple segments
    type ComplexParams =
      ExtractPathParams<'/organizations/:orgId/people/:personId/events/:eventId/attendances/:attendanceId'>

    const complexParamsObj: ComplexParams = {
      attendanceId: 'attendance-4',
      eventId: 'event-3',
      orgId: 'org-1',
      personId: 'person-2',
    }

    expect(complexParamsObj.orgId).toBe('org-1')
    expect(complexParamsObj.personId).toBe('person-2')
    expect(complexParamsObj.eventId).toBe('event-3')
    expect(complexParamsObj.attendanceId).toBe('attendance-4')
  }),
)

live('ExtractPathParams should return never type for paths without parameters', () =>
  Effect.sync(() => {
    // Test path without parameters
    type NoParams = ExtractPathParams<'/people'>

    // This should be never type - no path parameters are expected
    // @ts-expect-error - cannot assign anything to never type
    const noParamsObj: NoParams = {}

    // TypeScript should prevent accessing any parameters since type is never
    // @ts-expect-error - no parameters should be accessible on never type
    const _nonExistent = noParamsObj.personId

    // The test passes if TypeScript correctly prevents these assignments
    expect(true).toBe(true)
  }),
)

live('ExtractPathParams should handle paths with mixed static and dynamic segments', () =>
  Effect.sync(() => {
    // Test path with static segments between parameters
    type MixedParams = ExtractPathParams<'/organizations/:orgId/members/:memberId'>

    const mixedParamsObj: MixedParams = {
      memberId: 'member-456',
      orgId: 'org-123',
    }

    expect(mixedParamsObj.orgId).toBe('org-123')
    expect(mixedParamsObj.memberId).toBe('member-456')
  }),
)

live('ExtractPathParams should handle parameter at the end of path', () =>
  Effect.sync(() => {
    // Test path ending with parameter (no trailing slash)
    type EndParam = ExtractPathParams<'/people/:personId'>

    const endParamObj: EndParam = { personId: 'final-param' }
    expect(endParamObj.personId).toBe('final-param')
  }),
)

live('ExtractPathParams should handle parameter at the beginning of path', () =>
  Effect.sync(() => {
    // Test path starting with parameter
    type StartParam = ExtractPathParams<'/:rootId'>

    const startParamObj: StartParam = { rootId: 'root-123' }
    expect(startParamObj.rootId).toBe('root-123')
  }),
)

live('ExtractPathParams should work with realistic PCO-style paths', () =>
  Effect.sync(() => {
    // Test realistic PCO API paths
    type PcoPersonPath = ExtractPathParams<'/people/v2/people/:id'>
    type PcoEventPath =
      ExtractPathParams<'/calendar/v2/event_instances/:event_instance_id/attendances/:id'>
    type PcoGroupPath = ExtractPathParams<'/groups/v2/groups/:group_id/memberships/:id'>

    const personParams: PcoPersonPath = { id: 'person-123' }
    const eventParams: PcoEventPath = {
      event_instance_id: 'event-instance-456',
      id: 'attendance-789',
    }
    const groupParams: PcoGroupPath = {
      group_id: 'group-101',
      id: 'membership-202',
    }

    expect(personParams.id).toBe('person-123')
    expect(eventParams.event_instance_id).toBe('event-instance-456')
    expect(eventParams.id).toBe('attendance-789')
    expect(groupParams.group_id).toBe('group-101')
    expect(groupParams.id).toBe('membership-202')
  }),
)

live('ExtractPathParams should ensure all parameter values are strings', () =>
  Effect.sync(() => {
    // Test that all extracted parameters are typed as strings
    type ParamTypes = ExtractPathParams<'/users/:userId/posts/:postId'>

    const params: ParamTypes = {
      postId: '456', // Must be string
      userId: '123', // Must be string
    }

    // Verify they are strings at runtime
    expect(typeof params.userId).toBe('string')
    expect(typeof params.postId).toBe('string')

    // TypeScript should prevent non-string values
    // This should cause a type error if uncommented:
    // const invalidParams: ParamTypes = { userId: 123, postId: '456' }

    // Verify type safety by checking that only string assignments work
    const validStringAssignment: ParamTypes['userId'] = '123'
    expect(typeof validStringAssignment).toBe('string')
  }),
)

// Tests for toHttpApiEndpoint with payload property
live('toHttpApiEndpoint should work with POST endpoint with payload', () =>
  Effect.sync(() => {
    const payloadSchema = Schema.Struct({
      attributes: Schema.Struct({
        email: Schema.String,
        name: Schema.String,
      }),
    })

    const endpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          email: Schema.String,
          name: Schema.String,
        }),
        id: Schema.String,
        type: Schema.String,
      }),
      creatableFields: {
        fields: ['name', 'email'] as const,
        special: [] as const,
      },
      entity: 'User' as const,
      method: 'POST' as const,
      module: 'users' as const,
      name: 'createUser',
      path: '/users' as const,
      payload: payloadSchema,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            email: Schema.String,
            name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('createUser')
    expect(httpEndpoint.method).toBe('POST')
    expect(httpEndpoint.path).toBe('/users')
  }),
)

live('toHttpApiEndpoint should work with POST endpoint with data payload', () =>
  Effect.sync(() => {
    const payloadSchema = Schema.Struct({
      data: Schema.Struct({
        content: Schema.String,
        title: Schema.String,
      }),
    })

    const endpoint = {
      apiSchema: Schema.Struct({
        data: Schema.Struct({
          content: Schema.String,
          title: Schema.String,
        }),
        id: Schema.String,
        meta: Schema.Struct({}),
      }),
      creatableFields: {
        fields: ['title', 'content'] as const,
        special: [] as const,
      },
      entity: 'Post' as const,
      method: 'POST' as const,
      module: 'posts' as const,
      name: 'createPost',
      path: '/posts' as const,
      payload: payloadSchema,
      response: Schema.Struct({
        result: Schema.Struct({
          data: Schema.Struct({
            content: Schema.String,
            title: Schema.String,
          }),
          id: Schema.String,
        }),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('createPost')
    expect(httpEndpoint.method).toBe('POST')
    expect(httpEndpoint.path).toBe('/posts')
  }),
)

live('toHttpApiEndpoint should work with PATCH endpoint with fields payload', () =>
  Effect.sync(() => {
    const payloadSchema = Schema.Struct({
      fields: Schema.Struct({
        name: Schema.String,
        priority: Schema.Number,
      }),
    })

    const endpoint = {
      apiSchema: Schema.Struct({
        fields: Schema.Struct({
          description: Schema.String,
          name: Schema.String,
          priority: Schema.Number,
        }),
        id: Schema.String,
        type: Schema.String,
      }),
      entity: 'Task' as const,
      method: 'PATCH' as const,
      module: 'tasks' as const,
      name: 'updateTask',
      path: '/tasks/:taskId' as const,
      payload: payloadSchema,
      response: Schema.Struct({
        data: Schema.Struct({
          fields: Schema.Struct({
            name: Schema.String,
            priority: Schema.Number,
          }),
          id: Schema.String,
        }),
      }),
      updatableFields: {
        fields: ['name', 'priority'] as const,
        special: [] as const,
      },
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('updateTask')
    expect(httpEndpoint.method).toBe('PATCH')
    expect(httpEndpoint.path).toBe('/tasks/:taskId')
  }),
)

live('toHttpApiEndpoint should work with POST endpoint with flat payload', () =>
  Effect.sync(() => {
    const payloadSchema = Schema.Struct({
      age: Schema.Number,
      email: Schema.String,
      name: Schema.String,
    })

    const endpoint = {
      apiSchema: Schema.Struct({
        age: Schema.Number,
        email: Schema.String,
        id: Schema.String,
        name: Schema.String,
      }),
      creatableFields: {
        fields: ['name', 'email', 'age'] as const,
        special: [] as const,
      },
      entity: 'Contact' as const,
      method: 'POST' as const,
      module: 'contacts' as const,
      name: 'createContact',
      path: '/contacts' as const,
      payload: payloadSchema,
      response: Schema.Struct({
        age: Schema.Number,
        email: Schema.String,
        id: Schema.String,
        name: Schema.String,
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('createContact')
    expect(httpEndpoint.method).toBe('POST')
    expect(httpEndpoint.path).toBe('/contacts')
  }),
)

live('toHttpApiEndpoint should work with PATCH endpoint with flat payload', () =>
  Effect.sync(() => {
    const payloadSchema = Schema.Struct({
      name: Schema.String,
      status: Schema.String,
    })

    const endpoint = {
      apiSchema: Schema.Struct({
        id: Schema.String,
        name: Schema.String,
        priority: Schema.Number,
        status: Schema.String,
      }),
      entity: 'Issue' as const,
      method: 'PATCH' as const,
      module: 'issues' as const,
      name: 'updateIssue',
      path: '/issues/:issueId' as const,
      payload: payloadSchema,
      response: Schema.Struct({
        id: Schema.String,
        name: Schema.String,
        status: Schema.String,
      }),
      updatableFields: {
        fields: ['name', 'status'] as const,
        special: [] as const,
      },
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('updateIssue')
    expect(httpEndpoint.method).toBe('PATCH')
    expect(httpEndpoint.path).toBe('/issues/:issueId')
  }),
)

live('toHttpApiEndpoint should work with POST endpoint with properties payload', () =>
  Effect.sync(() => {
    const payloadSchema = Schema.Struct({
      properties: Schema.Struct({
        body: Schema.String,
        title: Schema.String,
      }),
    })

    const endpoint = {
      apiSchema: Schema.Struct({
        id: Schema.String,
        metadata: Schema.Struct({}),
        properties: Schema.Struct({
          body: Schema.String,
          tags: Schema.Array(Schema.String),
          title: Schema.String,
        }),
      }),
      creatableFields: {
        fields: ['title', 'body'] as const,
        special: [] as const,
      },
      entity: 'Article' as const,
      method: 'POST' as const,
      module: 'articles' as const,
      name: 'createArticle',
      path: '/articles' as const,
      payload: payloadSchema,
      response: Schema.Struct({
        data: Schema.Struct({
          id: Schema.String,
          properties: Schema.Struct({
            body: Schema.String,
            title: Schema.String,
          }),
        }),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('createArticle')
    expect(httpEndpoint.method).toBe('POST')
    expect(httpEndpoint.path).toBe('/articles')
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

    const payloadSchema = Schema.Struct({
      attributes: Schema.Struct({
        email: Schema.String,
        first_name: Schema.String,
        last_name: Schema.String,
      }),
    })

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
      payload: payloadSchema,
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

    const patchPayloadSchema = Schema.Struct({
      attributes: Schema.Struct({
        first_name: Schema.String,
        last_name: Schema.String,
      }),
    })

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
      payload: patchPayloadSchema,
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

// Additional tests for full coverage of toHttpApiEndpoint function

live('toHttpApiEndpoint should work with GET endpoint', () =>
  Effect.sync(() => {
    const getEndpoint = {
      method: 'GET',
      name: 'listPeople',
      path: '/people',
      query: Schema.Struct({
        include: Schema.optional(Schema.Array(Schema.String)),
        per_page: Schema.optional(Schema.Number),
      }),
      response: Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            id: Schema.String,
            type: Schema.String,
          }),
        ),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(getEndpoint)

    expect(httpEndpoint.name).toBe('listPeople')
    expect(httpEndpoint.method).toBe('GET')
    expect(httpEndpoint.path).toBe('/people')
  }),
)

live('toHttpApiEndpoint should work with GET endpoint with path parameters', () =>
  Effect.sync(() => {
    const getEndpoint = {
      method: 'GET',
      name: 'getPerson',
      path: '/people/:personId',
      query: Schema.Struct({
        include: Schema.optional(Schema.Array(Schema.String)),
      }),
      response: Schema.Struct({
        data: Schema.Struct({
          id: Schema.String,
          type: Schema.String,
        }),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(getEndpoint)

    expect(httpEndpoint.name).toBe('getPerson')
    expect(httpEndpoint.method).toBe('GET')
    expect(httpEndpoint.path).toBe('/people/:personId')
  }),
)

live('toHttpApiEndpoint should work with DELETE endpoint', () =>
  Effect.sync(() => {
    const deleteEndpoint = {
      method: 'DELETE',
      name: 'deletePerson',
      path: '/people/:personId',
      response: Schema.Void,
    }

    const httpEndpoint = toHttpApiEndpoint(deleteEndpoint)

    expect(httpEndpoint.name).toBe('deletePerson')
    expect(httpEndpoint.method).toBe('DELETE')
    expect(httpEndpoint.path).toBe('/people/:personId')
  }),
)

live('toHttpApiEndpoint should work with DELETE endpoint without path parameters', () =>
  Effect.sync(() => {
    const deleteEndpoint = {
      method: 'DELETE',
      name: 'deleteAll',
      path: '/people',
      response: Schema.Void,
    }

    const httpEndpoint = toHttpApiEndpoint(deleteEndpoint)

    expect(httpEndpoint.name).toBe('deleteAll')
    expect(httpEndpoint.method).toBe('DELETE')
    expect(httpEndpoint.path).toBe('/people')
  }),
)

// Error case tests for missing payload
live('toHttpApiEndpoint should throw error for POST endpoint without payload', () =>
  Effect.sync(() => {
    const postEndpointWithoutPayload = {
      method: 'POST',
      name: 'createPerson',
      path: '/people',
      response: Schema.Struct({
        data: Schema.Struct({
          id: Schema.String,
          type: Schema.String,
        }),
      }),
      // Missing payload property
    }

    expect(() => toHttpApiEndpoint(postEndpointWithoutPayload)).toThrow(
      "POST endpoint 'createPerson' must have a payload schema. Please ensure the endpoint definition includes a 'payload' property.",
    )
  }),
)

live('toHttpApiEndpoint should throw error for PATCH endpoint without payload', () =>
  Effect.sync(() => {
    const patchEndpointWithoutPayload = {
      method: 'PATCH',
      name: 'updatePerson',
      path: '/people/:personId',
      response: Schema.Struct({
        data: Schema.Struct({
          id: Schema.String,
          type: Schema.String,
        }),
      }),
      // Missing payload property
    }

    expect(() => toHttpApiEndpoint(patchEndpointWithoutPayload)).toThrow(
      "PATCH endpoint 'updatePerson' must have a payload schema. Please ensure the endpoint definition includes a 'payload' property.",
    )
  }),
)
