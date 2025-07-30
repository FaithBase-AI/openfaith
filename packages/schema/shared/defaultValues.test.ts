import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  generateDefaultValues,
  generateDefaultValuesWithOverrides,
} from '@openfaith/schema/shared/defaultValues'
import { Effect, Schema } from 'effect'

// Test schemas
const TestSchemaWithDefaults = Schema.Struct({
  _tag: Schema.Literal('TestEntity'),
  optionalBoolean: Schema.optional(Schema.Boolean),
  optionalNumber: Schema.optional(Schema.Number),
  optionalStatus: Schema.optional(
    Schema.Union(Schema.Literal('draft'), Schema.Literal('published')),
  ),
  optionalString: Schema.optional(Schema.String),
  requiredBoolean: Schema.Boolean,
  requiredNumber: Schema.Number,
  requiredString: Schema.String,
  status: Schema.Union(
    Schema.Literal('active'),
    Schema.Literal('inactive'),
    Schema.Literal('pending'),
  ),
})

effect('generateDefaultValues should generate defaults for required literal unions', () =>
  Effect.gen(function* () {
    const defaults = generateDefaultValues(TestSchemaWithDefaults as any)

    // Should include defaults for required literal unions
    expect(defaults).toHaveProperty('status', 'active') // First option from union

    // Should not include defaults for optional fields
    expect(defaults).not.toHaveProperty('optionalString')
    expect(defaults).not.toHaveProperty('optionalNumber')
    expect(defaults).not.toHaveProperty('optionalBoolean')
    expect(defaults).not.toHaveProperty('optionalStatus')

    // Should not include defaults for required non-literal fields
    expect(defaults).not.toHaveProperty('requiredString')
    expect(defaults).not.toHaveProperty('requiredNumber')
    expect(defaults).not.toHaveProperty('requiredBoolean')
  }),
)

effect('generateDefaultValues should handle schema with no literal unions', () =>
  Effect.gen(function* () {
    const SimpleSchema = Schema.Struct({
      _tag: Schema.Literal('Simple'),
      age: Schema.Number,
      isActive: Schema.Boolean,
      name: Schema.String,
    })

    const defaults = generateDefaultValues(SimpleSchema as any)

    // Should return empty object since no literal unions
    expect(Object.keys(defaults)).toHaveLength(0)
  }),
)

effect('generateDefaultValues should handle schema with only optional fields', () =>
  Effect.gen(function* () {
    const OptionalSchema = Schema.Struct({
      _tag: Schema.Literal('Optional'),
      optionalAge: Schema.optional(Schema.Number),
      optionalName: Schema.optional(Schema.String),
      optionalStatus: Schema.optional(Schema.Union(Schema.Literal('yes'), Schema.Literal('no'))),
    })

    const defaults = generateDefaultValues(OptionalSchema as any)

    // Should return empty object since all fields are optional
    expect(Object.keys(defaults)).toHaveLength(0)
  }),
)

effect('generateDefaultValuesWithOverrides should merge auto defaults with overrides', () =>
  Effect.gen(function* () {
    const defaults = generateDefaultValuesWithOverrides(TestSchemaWithDefaults as any, {
      optionalString: 'Override Optional',
      requiredString: 'Custom Value',
    })

    // Should include auto-generated defaults
    expect(defaults).toHaveProperty('status', 'active')

    // Should include overrides
    expect(defaults).toHaveProperty('requiredString', 'Custom Value')
    expect(defaults).toHaveProperty('optionalString', 'Override Optional')
  }),
)

effect('generateDefaultValuesWithOverrides should override auto defaults', () =>
  Effect.gen(function* () {
    const defaults = generateDefaultValuesWithOverrides(TestSchemaWithDefaults as any, {
      status: 'inactive', // Override the auto-generated default
    })

    // Should use the override value instead of auto-generated
    expect(defaults).toHaveProperty('status', 'inactive')
  }),
)

effect('generateDefaultValuesWithOverrides should work with empty overrides', () =>
  Effect.gen(function* () {
    const defaults = generateDefaultValuesWithOverrides(TestSchemaWithDefaults as any, {})

    // Should be same as generateDefaultValues
    const autoDefaults = generateDefaultValues(TestSchemaWithDefaults as any)
    expect(defaults).toEqual(autoDefaults)
  }),
)

effect('generateDefaultValuesWithOverrides should work with undefined overrides', () =>
  Effect.gen(function* () {
    const defaults = generateDefaultValuesWithOverrides(TestSchemaWithDefaults as any)

    // Should be same as generateDefaultValues
    const autoDefaults = generateDefaultValues(TestSchemaWithDefaults as any)
    expect(defaults).toEqual(autoDefaults)
  }),
)
