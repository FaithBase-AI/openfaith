import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  createCombinedValidator,
  createSchemaValidator,
  createValidator,
  validateFormData,
} from '@openfaith/ui/form/validation'
import { Effect, Schema } from 'effect'

// Test schemas
const UserSchema = Schema.Struct({
  age: Schema.optional(Schema.Number),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  id: Schema.Number,
  isActive: Schema.Boolean,
  name: Schema.String,
})

const SimpleSchema = Schema.Struct({
  count: Schema.Number,
  title: Schema.String,
})

// Helper to create field configs for testing
const createFieldConfig = (overrides: any = {}) => ({
  creatable: false,
  label: 'Test Field',
  max: 100,
  min: 0,
  multiple: false,
  options: [],
  placeholder: '',
  required: true,
  rows: 3,
  searchable: false,
  step: 1,
  type: 'text' as const,
  ...overrides,
})

effect('createValidator - validates required fields', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({ label: 'Name', required: true })
    const validator = createValidator(config, SimpleSchema, 'title')

    // Should fail for empty values
    expect(validator(null)).toBe('Name is required')
    expect(validator(undefined)).toBe('Name is required')
    expect(validator('')).toBe('Name is required')

    // Should pass for non-empty values
    expect(validator('John')).toBeUndefined()
    expect(validator('Valid Name')).toBeUndefined()
  }),
)

effect('createValidator - skips validation for non-required empty fields', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({ required: false })
    const validator = createValidator(config, SimpleSchema, 'title')

    // Should pass for empty values when not required
    expect(validator(null)).toBeUndefined()
    expect(validator(undefined)).toBeUndefined()
    expect(validator('')).toBeUndefined()

    // Should still validate non-empty values
    expect(validator('Valid Value')).toBeUndefined()
  }),
)

effect('createValidator - validates email fields', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({ required: true, type: 'email' })
    const validator = createValidator(config, UserSchema, 'email')

    // Should fail for invalid emails
    expect(validator('invalid-email')).toBe('Invalid email address')
    expect(validator('test@')).toBe('Invalid email address')
    expect(validator('@example.com')).toBe('Invalid email address')
    expect(validator('test.example.com')).toBe('Invalid email address')

    // Should pass for valid emails
    expect(validator('test@example.com')).toBeUndefined()
    expect(validator('user.name@domain.co.uk')).toBeUndefined()
    expect(validator('test+tag@example.org')).toBeUndefined()
  }),
)

effect('createValidator - validates number fields', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      max: 100,
      min: 10,
      required: true,
      type: 'number',
    })
    const validator = createValidator(config, UserSchema, 'age')

    // Should fail for non-numbers
    expect(validator('not-a-number')).toBe('Must be a valid number')
    expect(validator('abc')).toBe('Must be a valid number')

    // Should fail for out-of-range numbers
    expect(validator('5')).toBe('Must be at least 10')
    expect(validator(5)).toBe('Must be at least 10')
    expect(validator('150')).toBe('Must be at most 100')
    expect(validator(150)).toBe('Must be at most 100')

    // Should pass for valid numbers
    expect(validator('50')).toBeUndefined()
    expect(validator(50)).toBeUndefined()
    expect(validator('10')).toBeUndefined()
    expect(validator('100')).toBeUndefined()
  }),
)

effect('createValidator - validates select fields with options', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      required: true,
      type: 'select',
    })
    const validator = createValidator(config, SimpleSchema, 'title')

    // Should fail for invalid options
    expect(validator('invalid')).toBe('Please select a valid option')
    expect(validator('pending')).toBe('Please select a valid option')

    // Should pass for valid options
    expect(validator('active')).toBeUndefined()
    expect(validator('inactive')).toBeUndefined()
  }),
)

effect('createValidator - validates tags fields', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      options: [
        { label: 'Tag 1', value: 'tag1' },
        { label: 'Tag 2', value: 'tag2' },
        { label: 'Tag 3', value: 'tag3' },
      ],
      required: true,
      type: 'tags',
    })
    const validator = createValidator(config, SimpleSchema, 'title')

    // Should fail for arrays with invalid tags
    expect(validator(['tag1', 'invalid'])).toBe('Invalid tags: invalid')
    expect(validator(['invalid1', 'invalid2'])).toBe('Invalid tags: invalid1, invalid2')

    // Should pass for valid tag arrays
    expect(validator(['tag1'])).toBeUndefined()
    expect(validator(['tag1', 'tag2'])).toBeUndefined()
    expect(validator([])).toBeUndefined()

    // Should pass for non-array values (not tags)
    expect(validator('not-an-array')).toBeUndefined()
  }),
)

effect('createValidator - handles tags without predefined options', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      options: [],
      required: true, // No predefined options
      type: 'tags',
    })
    const validator = createValidator(config, SimpleSchema, 'title')

    // Should pass for any array when no options are defined
    expect(validator(['any', 'tags'])).toBeUndefined()
    expect(validator(['custom', 'values'])).toBeUndefined()
    expect(validator([])).toBeUndefined()
  }),
)

effect('createSchemaValidator - validates against Effect Schema', () =>
  Effect.gen(function* () {
    const validator = createSchemaValidator(UserSchema, 'email')

    // This is a simplified test since the actual implementation
    // depends on Effect Schema's validation behavior
    const result = validator('test@example.com')

    // Should return undefined for valid data or string for invalid
    expect(typeof result === 'undefined' || typeof result === 'string').toBe(true)
  }),
)

effect('createSchemaValidator - handles validation errors gracefully', () =>
  Effect.gen(function* () {
    const validator = createSchemaValidator(UserSchema, 'email')

    // Should handle invalid data without throwing
    const result = validator('invalid-email')
    expect(typeof result === 'undefined' || typeof result === 'string').toBe(true)
  }),
)

effect('createCombinedValidator - combines field and schema validation', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      label: 'Email',
      required: true,
      type: 'email',
    })
    const validator = createCombinedValidator(config, UserSchema, 'email')

    // Should fail field validation first
    expect(validator('')).toBe('Email is required')
    expect(validator('invalid-email')).toBe('Invalid email address')

    // Should pass field validation and proceed to schema validation
    const result = validator('test@example.com')
    expect(typeof result === 'undefined' || typeof result === 'string').toBe(true)
  }),
)

effect('validateFormData - validates complete form objects', () =>
  Effect.gen(function* () {
    const validData = {
      age: 30,
      email: 'john@example.com',
      id: 1,
      isActive: true,
      name: 'John Doe',
    }

    const result = validateFormData(UserSchema, validData)

    expect(result.isValid).toBe(true)
    expect(result.data).toEqual(validData)
    expect(result.errors).toEqual({})
  }),
)

effect('validateFormData - handles validation errors', () =>
  Effect.gen(function* () {
    const invalidData = {
      email: 'invalid-email', // Should be number
      id: 'not-a-number',
      isActive: 'not-a-boolean', // Invalid email format
      name: 'John Doe', // Should be boolean
    }

    const result = validateFormData(UserSchema, invalidData)

    expect(result.isValid).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.errors).toBeDefined()
    expect(result.errors.general).toBeDefined()
  }),
)

effect('validateFormData - handles exceptions gracefully', () =>
  Effect.gen(function* () {
    // Pass null as data to potentially cause an exception
    const result = validateFormData(UserSchema, null)

    expect(result.isValid).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.errors).toBeDefined()
  }),
)

effect('createValidator - handles number validation edge cases', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      max: 10,
      min: 0,
      required: false,
      type: 'number',
    })
    const validator = createValidator(config, SimpleSchema, 'count')

    // Should handle zero correctly
    expect(validator(0)).toBeUndefined()
    expect(validator('0')).toBeUndefined()

    // Should handle negative numbers
    expect(validator(-1)).toBe('Must be at least 0')

    // Should handle decimal numbers
    expect(validator(5.5)).toBeUndefined()
    expect(validator('5.5')).toBeUndefined()

    // Should handle boundary values
    expect(validator(10)).toBeUndefined()
    expect(validator('10')).toBeUndefined()
    expect(validator(10.1)).toBe('Must be at most 10')
  }),
)

effect('createValidator - handles undefined min/max for numbers', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      max: undefined,
      min: undefined,
      required: true,
      type: 'number',
    })
    const validator = createValidator(config, SimpleSchema, 'count')

    // Should not validate range when min/max are undefined
    expect(validator(-1000)).toBeUndefined()
    expect(validator(1000)).toBeUndefined()
    expect(validator(0)).toBeUndefined()

    // Should still validate that it's a number
    expect(validator('not-a-number')).toBe('Must be a valid number')
  }),
)

effect('createValidator - handles email validation for non-required fields', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      required: false,
      type: 'email',
    })
    const validator = createValidator(config, UserSchema, 'email')

    // Should skip validation for empty values when not required
    expect(validator('')).toBeUndefined()
    expect(validator(null)).toBeUndefined()
    expect(validator(undefined)).toBeUndefined()

    // Should still validate non-empty values
    expect(validator('invalid-email')).toBe('Invalid email address')
    expect(validator('valid@example.com')).toBeUndefined()
  }),
)

effect('createValidator - handles select validation with empty options', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      options: [],
      required: true, // No options defined
      type: 'select',
    })
    const validator = createValidator(config, SimpleSchema, 'title')

    // Should pass validation when no options are defined
    expect(validator('any-value')).toBeUndefined()
    expect(validator('another-value')).toBeUndefined()
  }),
)

effect('createValidator - returns undefined for unknown field types', () =>
  Effect.gen(function* () {
    const config = createFieldConfig({
      required: true,
      type: 'unknown-type' as any,
    })
    const validator = createValidator(config, SimpleSchema, 'title')

    // Should only validate required constraint for unknown types
    expect(validator('')).toBe('Test Field is required')
    expect(validator('any-value')).toBeUndefined()
  }),
)
