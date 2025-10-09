import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Campus } from '@openfaith/schema/domain/ofCampusSchema'
import {
  extractAST,
  extractEntityInfo,
  extractEntityTagOpt,
  extractLiteralOptions,
  extractSchemaFields,
  getUiConfig,
  getUiConfigFromAST,
  getZeroMutationSchema,
  hasEmailPattern,
} from '@openfaith/schema/shared/introspection'
import { OfEntity, OfUiConfig } from '@openfaith/schema/shared/schema'
import { TimestampToIsoString } from '@openfaith/shared/date'
import { Effect, pipe, Schema } from 'effect'

// Test schemas
const TestPersonSchema = Schema.Struct({
  _tag: Schema.Literal('Person'),
  age: Schema.Number,
  bio: Schema.optional(Schema.String),
  email: Schema.String,
  firstName: Schema.String,
  id: Schema.String.pipe(Schema.annotations({ description: 'Person typeid' })),
  isActive: Schema.Boolean,
  lastName: Schema.String,
  status: Schema.Union(
    Schema.Literal('active'),
    Schema.Literal('inactive'),
    Schema.Literal('pending'),
  ),
  tags: Schema.optional(Schema.Array(Schema.String)),
})

const TestSchemaWithAnnotations = Schema.Struct({
  _tag: Schema.Literal('TestEntity'),
  annotatedField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        field: {
          label: 'Custom Label',
          placeholder: 'Enter text here',
          type: 'textarea',
        },
        table: {
          cellType: 'text',
          header: 'Custom Header',
          width: 200,
        },
      },
    }),
  ),
  hiddenField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        field: { hidden: true },
        table: { hidden: true },
      },
    }),
  ),
})

effect('extractSchemaFields should extract all fields with correct metadata', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestPersonSchema as any)

    expect(fields.length).toBe(10)

    // Check specific fields
    const idField = fields.find((f) => f.key === 'id')
    expect(idField).toBeDefined()
    expect(idField?.isOptional).toBe(false)
    expect(idField?.isNullable).toBe(false)

    const bioField = fields.find((f) => f.key === 'bio')
    expect(bioField).toBeDefined()
    expect(bioField?.isOptional).toBe(true)
    expect(bioField?.isNullable).toBe(false)

    const tagsField = fields.find((f) => f.key === 'tags')
    expect(tagsField).toBeDefined()
    expect(tagsField?.isOptional).toBe(true)
  }),
)

effect('getUiConfig should extract UI configuration from schema annotations', () =>
  Effect.gen(function* () {
    const config = getUiConfig(TestSchemaWithAnnotations as any)
    expect(config).toBeUndefined() // Schema itself doesn't have UI config, only fields do
  }),
)

effect('getUiConfigFromAST should extract UI configuration from field AST', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithAnnotations as any)
    const annotatedField = fields.find((f) => f.key === 'annotatedField')
    expect(annotatedField).toBeDefined()

    const config = getUiConfigFromAST(annotatedField!.schema)
    expect(config).toBeDefined()
    expect(config?.field?.type).toBe('textarea')
    expect(config?.field?.label).toBe('Custom Label')
    expect(config?.table?.cellType).toBe('text')
    expect(config?.table?.header).toBe('Custom Header')
  }),
)

effect('extractAST should handle both PropertySignature and AST types', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestPersonSchema as any)
    const firstNameField = fields.find((f) => f.key === 'firstName')
    expect(firstNameField).toBeDefined()

    const ast = extractAST(firstNameField!.schema)
    expect(ast).toBeDefined()
    expect(ast._tag).toBe('StringKeyword')
  }),
)

effect('hasEmailPattern should detect email patterns in refinements', () =>
  Effect.gen(function* () {
    // This is a simplified test - the actual implementation is basic
    const stringAST = Schema.String.ast
    const result = hasEmailPattern(stringAST)
    expect(result).toBe(false) // Current implementation always returns false
  }),
)

effect('extractLiteralOptions should extract options from union literals', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestPersonSchema as any)
    const statusField = fields.find((f) => f.key === 'status')
    expect(statusField).toBeDefined()

    const options = extractLiteralOptions(statusField!.schema.type)
    expect(options.length).toBe(3)
    expect(options).toEqual([
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
    ])
  }),
)

effect('extractLiteralOptions should handle single literals', () =>
  Effect.gen(function* () {
    const singleLiteralSchema = Schema.Literal('test')
    const options = extractLiteralOptions(singleLiteralSchema.ast)
    expect(options).toEqual([{ label: 'Test', value: 'test' }])
  }),
)

effect('extractLiteralOptions should return empty array for non-literal types', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String
    const options = extractLiteralOptions(stringSchema.ast)
    expect(options).toEqual([])
  }),
)

effect('extractEntityTag should extract _tag literal from schema', () =>
  Effect.gen(function* () {
    const personTagOpt = extractEntityTagOpt(TestPersonSchema.ast)
    expect(personTagOpt._tag).toBe('Some')
    if (personTagOpt._tag === 'Some') {
      expect(personTagOpt.value).toBe('Person')
    }

    const testEntityTagOpt = extractEntityTagOpt(TestSchemaWithAnnotations.ast)
    expect(testEntityTagOpt._tag).toBe('Some')
    if (testEntityTagOpt._tag === 'Some') {
      expect(testEntityTagOpt.value).toBe('TestEntity')
    }
  }),
)

effect('extractEntityTag should return None for schemas without _tag', () =>
  Effect.gen(function* () {
    const SchemaWithoutTag = Schema.Struct({
      id: Schema.String,
      name: Schema.String,
    })

    const tagOpt = extractEntityTagOpt(SchemaWithoutTag.ast)
    expect(tagOpt._tag).toBe('None')
  }),
)

effect('extractEntityTag should return None for non-TypeLiteral schemas', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String
    const tagOpt = extractEntityTagOpt(stringSchema.ast)
    expect(tagOpt._tag).toBe('None')
  }),
)

// Tests for extractEntityInfo function
effect(
  'extractEntityInfo should extract entity name and tag from schema with OfEntity annotation',
  () =>
    Effect.gen(function* () {
      const TestSchemaWithEntity = Schema.Struct({
        id: Schema.String,
        name: Schema.String,
      }).pipe(
        Schema.annotations({
          [OfEntity]: Schema.Struct({
            _tag: Schema.Literal('TestEntity'),
          }),
        }),
      )

      const entityInfo = extractEntityInfo(TestSchemaWithEntity)

      expect(entityInfo.entityName).toBe('TestEntity')
      expect(entityInfo.entityTag).toBe('TestEntity')
    }),
)

effect(
  'extractEntityInfo should return default entity name for schema without OfEntity annotation',
  () =>
    Effect.gen(function* () {
      const TestSchemaWithoutEntity = Schema.Struct({
        id: Schema.String,
        name: Schema.String,
      })

      const entityInfo = extractEntityInfo(TestSchemaWithoutEntity)

      expect(entityInfo.entityName).toBe('item')
      expect(entityInfo.entityTag).toBeUndefined()
    }),
)

effect('extractEntityInfo should handle complex schema structures', () =>
  Effect.gen(function* () {
    const ComplexSchema = Schema.Struct({
      id: Schema.String,
      metadata: Schema.Struct({
        created: Schema.String, // Simplified to avoid Date encoding issues
        tags: Schema.Array(Schema.String),
      }),
      settings: Schema.optional(
        Schema.Struct({
          enabled: Schema.Boolean,
        }),
      ),
    }).pipe(
      Schema.annotations({
        [OfEntity]: Schema.Struct({
          _tag: Schema.Literal('ComplexEntity'),
        }),
      }),
    )

    const entityInfo = extractEntityInfo(ComplexSchema)

    expect(entityInfo.entityName).toBe('ComplexEntity')
    expect(entityInfo.entityTag).toBe('ComplexEntity')
  }),
)
effect('extractEntityInfo should handle schema with multiple annotations', () =>
  Effect.gen(function* () {
    const MultiAnnotatedSchema = Schema.Struct({
      id: Schema.String,
      name: Schema.String,
    }).pipe(
      Schema.annotations({
        [OfEntity]: Schema.Struct({
          _tag: Schema.Literal('MultiEntity'),
        }),
        description: 'A schema with multiple annotations',
        title: 'Multi Annotated Schema',
      }),
    )

    const entityInfo = extractEntityInfo(MultiAnnotatedSchema)

    expect(entityInfo.entityName).toBe('MultiEntity')
    expect(entityInfo.entityTag).toBe('MultiEntity')
  }),
)

effect('getServerMutationSchema should detect and transform TimestampToIsoString fields', () =>
  Effect.gen(function* () {
    const TestSchemaWithTimestamp = Schema.Struct({
      createdAt: TimestampToIsoString,
      id: Schema.String,
      name: Schema.String,
      updatedAt: TimestampToIsoString,
    })

    const serverSchema = getZeroMutationSchema(TestSchemaWithTimestamp)

    const testData = {
      createdAt: '2025-10-08T19:00:23Z',
      id: 'test_123',
      name: 'Test Item',
      updatedAt: '2025-10-09T09:58:28Z',
    }

    const encoded = yield* Schema.decodeUnknown(serverSchema)(testData)

    expect(typeof encoded.createdAt).toBe('number')
    expect(typeof encoded.updatedAt).toBe('number')
    expect(typeof encoded.id).toBe('string')
    expect(typeof encoded.name).toBe('string')

    expect(encoded.createdAt).toBe(new Date('2025-10-08T19:00:23Z').getTime())
    expect(encoded.updatedAt).toBe(new Date('2025-10-09T09:58:28Z').getTime())
    expect(encoded.id).toBe('test_123')
    expect(encoded.name).toBe('Test Item')
  }),
)

effect('getServerMutationSchema should handle optional timestamp fields', () =>
  Effect.gen(function* () {
    const TestSchemaWithOptionalTimestamp = Schema.Struct({
      createdAt: TimestampToIsoString,
      id: Schema.String,
      name: Schema.String,
      updatedAt: pipe(TimestampToIsoString, Schema.NullOr, Schema.optional),
    })

    const serverSchema = getZeroMutationSchema(TestSchemaWithOptionalTimestamp)

    const testDataWithTimestamp = {
      createdAt: '2025-10-08T19:00:23Z',
      id: 'test_123',
      name: 'Test Item',
      updatedAt: '2025-10-09T09:58:28Z',
    }

    const encodedWithTimestamp = yield* Schema.decodeUnknown(serverSchema)(testDataWithTimestamp)

    expect(typeof encodedWithTimestamp.createdAt).toBe('number')
    expect(typeof encodedWithTimestamp.updatedAt).toBe('number')

    const testDataWithoutTimestamp = {
      createdAt: '2025-10-08T19:00:23Z',
      id: 'test_456',
      name: 'Test Item 2',
    }

    const encodedWithoutTimestamp =
      yield* Schema.decodeUnknown(serverSchema)(testDataWithoutTimestamp)

    expect(typeof encodedWithoutTimestamp.createdAt).toBe('number')
    expect(encodedWithoutTimestamp.updatedAt).toBeUndefined()
  }),
)

effect('getServerMutationSchema should work with Campus schema', () =>
  Effect.gen(function* () {
    const serverSchema = getZeroMutationSchema(Campus)

    const testCampus = {
      _tag: 'campus',
      createdAt: '2025-10-08T19:00:23Z',
      createdBy: 'user_01k4czcs2becvrpzahnb5n81h6',
      customFields: [],
      externalIds: [],
      id: 'campus_01k72k4b50fk4vjb6fcby0a0vj',
      name: 'Test Campus',
      orgId: 'org_01k4czcyszecvrpzb14tcq5b5j',
      status: 'active',
      tags: [],
      updatedAt: '2025-10-09T09:58:28Z',
      updatedBy: 'user_01k4czcs2becvrpzahnb5n81h6',
    }

    const encoded = yield* Schema.decodeUnknown(serverSchema)(testCampus)

    expect(typeof encoded.createdAt).toBe('number')
    expect(typeof encoded.updatedAt).toBe('number')
    expect(encoded.createdAt).toBe(new Date('2025-10-08T19:00:23Z').getTime())
    expect(encoded.updatedAt).toBe(new Date('2025-10-09T09:58:28Z').getTime())

    expect(encoded.name).toBe('Test Campus')
    expect(encoded.id).toBe('campus_01k72k4b50fk4vjb6fcby0a0vj')
    expect(encoded._tag).toBe('campus')
  }),
)

effect('getServerMutationSchema should preserve non-timestamp fields correctly', () =>
  Effect.gen(function* () {
    const TestMixedSchema = Schema.Struct({
      active: Schema.Boolean,
      age: Schema.Number,
      count: pipe(Schema.Number, Schema.optional),
      createdAt: TimestampToIsoString,
      description: pipe(Schema.String, Schema.NullOr, Schema.optional),
      id: Schema.String,
      tags: Schema.Array(Schema.String),
    })

    const serverSchema = getZeroMutationSchema(TestMixedSchema)

    const testData = {
      active: true,
      age: 25,
      count: 42,
      createdAt: '2025-10-08T19:00:23Z',
      description: 'Test description',
      id: 'test_123',
      tags: ['tag1', 'tag2'],
    }

    const encoded = yield* Schema.decodeUnknown(serverSchema)(testData)

    expect(typeof encoded.createdAt).toBe('number')
    expect(typeof encoded.active).toBe('boolean')
    expect(typeof encoded.age).toBe('number')
    expect(typeof encoded.count).toBe('number')
    expect(typeof encoded.description).toBe('string')
    expect(typeof encoded.id).toBe('string')
    expect(Array.isArray(encoded.tags)).toBe(true)

    expect(encoded.active).toBe(true)
    expect(encoded.age).toBe(25)
    expect(encoded.count).toBe(42)
    expect(encoded.tags).toEqual(['tag1', 'tag2'])
  }),
)
