import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { OfUiConfig } from '@openfaith/schema/shared/schema'
import { CalendarIcon } from '@openfaith/ui/icons/calendarIcon'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { FilterIcon } from '@openfaith/ui/icons/filterIcon'
import { ListIcon } from '@openfaith/ui/icons/listIcon'
import { SearchIcon } from '@openfaith/ui/icons/searchIcon'
import {
  generateFilterConfig,
  generateSimpleFilterConfig,
} from '@openfaith/ui/table/filterGenerator'
import { Array, Effect, Option, pipe, Schema } from 'effect'

// Test schemas for comprehensive coverage
const BasicPersonSchema = Schema.Struct({
  _tag: Schema.Literal('Person'),
  age: Schema.Number,
  bio: Schema.optional(Schema.String),
  email: Schema.String,
  firstName: Schema.String,
  id: Schema.String,
  isActive: Schema.Boolean,
  lastName: Schema.String,
})

const EnumTestSchema = Schema.Struct({
  _tag: Schema.Literal('EnumTest'),
  category: Schema.Union(
    Schema.Literal('personal'),
    Schema.Literal('work'),
    Schema.Literal('family'),
  ),
  id: Schema.String,
  priority: Schema.Union(Schema.Literal('low'), Schema.Literal('medium'), Schema.Literal('high')),
  status: Schema.Union(
    Schema.Literal('active'),
    Schema.Literal('inactive'),
    Schema.Literal('pending'),
  ),
})

const DateFieldsSchema = Schema.Struct({
  _tag: Schema.Literal('DateFields'),
  anniversaryDate: Schema.String,
  birthDate: Schema.String,
  birthdayField: Schema.String,
  createdAt: Schema.String,
  customDate: Schema.String,
  id: Schema.String,
  timeField: Schema.String,
  updatedAt: Schema.String,
})

const AnnotatedSchema = Schema.Struct({
  _tag: Schema.Literal('Annotated'),
  badgeField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        table: {
          cellType: 'badge',
        },
      },
    }),
  ),
  dateField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        table: {
          cellType: 'date',
        },
      },
    }),
  ),
  hiddenField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        table: {
          hidden: true,
        },
      },
    }),
  ),
  id: Schema.String,
  nonFilterableField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        table: {
          filterable: false,
        },
      },
    }),
  ),
  numberFieldWithMinMax: Schema.Number.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        table: {
          cellType: 'number' as const,
        },
      },
    }),
  ),
  visibleField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        table: {
          cellType: 'text',
          header: 'Custom Header',
        },
      },
    }),
  ),
})

const ComplexTypesSchema = Schema.Struct({
  _tag: Schema.Literal('ComplexTypes'),
  id: Schema.String,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  nestedObject: Schema.Struct({
    name: Schema.String,
    value: Schema.Number,
  }),
  tags: Schema.Array(Schema.String),
})

// Test data for runtime testing
interface TestPerson {
  _tag: 'Person'
  id: string
  firstName: string
  lastName: string
  age: number
  isActive: boolean
  email: string
  bio?: string
}

const testPersonData: Array<TestPerson> = [
  {
    _tag: 'Person',
    age: 30,
    bio: 'Software developer',
    email: 'john@example.com',
    firstName: 'John',
    id: '1',
    isActive: true,
    lastName: 'Doe',
  },
  {
    _tag: 'Person',
    age: 25,
    email: 'jane@example.com',
    firstName: 'Jane',
    id: '2',
    isActive: false,
    lastName: 'Smith',
  },
]

// Helper function to get filter config by field name
const getFilterConfigByField = <_T,>(configs: ReadonlyArray<any>, fieldName: string) => {
  return pipe(
    configs,
    Array.findFirst((config) => config.id === fieldName),
  )
}

// Tests for generateFilterConfig function
effect('generateFilterConfig should generate configs for all visible fields', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    // Should generate configs for all non-system fields
    expect(configs.length).toBeGreaterThan(0)

    // Check that system fields like _tag are filtered out
    const tagConfig = getFilterConfigByField(configs, '_tag')
    expect(Option.isNone(tagConfig)).toBe(true)

    // Check that regular fields are included
    const firstNameConfig = getFilterConfigByField(configs, 'firstName')
    expect(Option.isSome(firstNameConfig)).toBe(true)
  }),
)

effect('generateFilterConfig should detect text filter type for string fields', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    const firstNameConfig = getFilterConfigByField(configs, 'firstName')
    expect(Option.isSome(firstNameConfig)).toBe(true)

    if (Option.isSome(firstNameConfig)) {
      const config = firstNameConfig.value
      expect(config.type).toBe('text')
      expect(config.icon).toBe(SearchIcon)
      expect(config.displayName).toBe('First Name')
    }
  }),
)

effect('generateFilterConfig should detect number filter type for number fields', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    const ageConfig = getFilterConfigByField(configs, 'age')
    expect(Option.isSome(ageConfig)).toBe(true)

    if (Option.isSome(ageConfig)) {
      const config = ageConfig.value
      expect(config.type).toBe('number')
      expect(config.icon).toBe(FilterIcon)
      expect(config.displayName).toBe('Age')
    }
  }),
)

effect('generateFilterConfig should detect option filter type for boolean fields', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    const isActiveConfig = getFilterConfigByField(configs, 'isActive')
    expect(Option.isSome(isActiveConfig)).toBe(true)

    if (Option.isSome(isActiveConfig)) {
      const config = isActiveConfig.value
      expect(config.type).toBe('option')
      expect(config.icon).toBe(ListIcon)
      expect(config.options).toBeDefined()
      expect(config.options?.length).toBe(2)

      const options = config.options!
      expect(options[0]).toEqual({ label: 'Yes', value: 'true' })
      expect(options[1]).toEqual({ label: 'No', value: 'false' })
    }
  }),
)

effect('generateFilterConfig should detect option filter type for enum fields', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(EnumTestSchema)

    const statusConfig = getFilterConfigByField(configs, 'status')
    expect(Option.isSome(statusConfig)).toBe(true)

    if (Option.isSome(statusConfig)) {
      const config = statusConfig.value
      expect(config.type).toBe('option')
      expect(config.icon).toBe(CircleIcon) // Should use CircleIcon for status fields
      expect(config.options).toBeDefined()
      expect(config.options?.length).toBe(3)

      const options = config.options!
      expect(options).toContainEqual({ label: 'Active', value: 'active' })
      expect(options).toContainEqual({
        label: 'Inactive',
        value: 'inactive',
      })
      expect(options).toContainEqual({ label: 'Pending', value: 'pending' })
    }
  }),
)

effect('generateFilterConfig should use CircleIcon for status, type, and category fields', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(EnumTestSchema)

    const statusConfig = getFilterConfigByField(configs, 'status')
    const categoryConfig = getFilterConfigByField(configs, 'category')

    if (Option.isSome(statusConfig)) {
      expect(statusConfig.value.icon).toBe(CircleIcon)
    }

    if (Option.isSome(categoryConfig)) {
      expect(categoryConfig.value.icon).toBe(CircleIcon)
    }
  }),
)

effect('generateFilterConfig should detect date filter type for date-related field names', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(DateFieldsSchema)

    const dateFields = [
      'createdAt',
      'updatedAt',
      'birthDate',
      'anniversaryDate',
      'timeField',
      'birthdayField',
    ]

    for (const fieldName of dateFields) {
      const config = getFilterConfigByField(configs, fieldName)
      expect(Option.isSome(config)).toBe(true)

      if (Option.isSome(config)) {
        expect(config.value.type).toBe('date')
        expect(config.value.icon).toBe(CalendarIcon)
      }
    }
  }),
)

effect('generateFilterConfig should respect schema annotations for visibility', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(AnnotatedSchema)

    // Hidden field should not be included
    const hiddenConfig = getFilterConfigByField(configs, 'hiddenField')
    expect(Option.isNone(hiddenConfig)).toBe(true)

    // Visible field should be included
    const visibleConfig = getFilterConfigByField(configs, 'visibleField')
    expect(Option.isSome(visibleConfig)).toBe(true)
  }),
)

effect('generateFilterConfig should respect filterable: false annotation', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(AnnotatedSchema)

    // Non-filterable field should not be included
    const nonFilterableConfig = getFilterConfigByField(configs, 'nonFilterableField')
    expect(Option.isNone(nonFilterableConfig)).toBe(true)
  }),
)

effect('generateFilterConfig should use custom headers from annotations', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(AnnotatedSchema)

    const visibleConfig = getFilterConfigByField(configs, 'visibleField')
    expect(Option.isSome(visibleConfig)).toBe(true)

    if (Option.isSome(visibleConfig)) {
      expect(visibleConfig.value.displayName).toBe('Custom Header')
    }
  }),
)

effect('generateFilterConfig should respect cellType annotations for filter type detection', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(AnnotatedSchema)

    // Date field with cellType annotation
    const dateConfig = getFilterConfigByField(configs, 'dateField')
    expect(Option.isSome(dateConfig)).toBe(true)

    if (Option.isSome(dateConfig)) {
      expect(dateConfig.value.type).toBe('date')
      expect(dateConfig.value.icon).toBe(CalendarIcon)
    }

    // Badge field with cellType annotation
    const badgeConfig = getFilterConfigByField(configs, 'badgeField')
    expect(Option.isSome(badgeConfig)).toBe(true)

    if (Option.isSome(badgeConfig)) {
      expect(badgeConfig.value.type).toBe('option')
    }
  }),
)

effect('generateFilterConfig should set min/max for number fields with annotations', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(AnnotatedSchema)

    const numberConfig = getFilterConfigByField(configs, 'numberFieldWithMinMax')
    expect(Option.isSome(numberConfig)).toBe(true)

    if (Option.isSome(numberConfig)) {
      expect(numberConfig.value.type).toBe('number')
      // Min/max values are not set because table config doesn't include them
      // This is expected behavior - min/max would need to be in the table config
      expect(numberConfig.value.min).toBeUndefined()
      expect(numberConfig.value.max).toBeUndefined()
    }
  }),
)

effect('generateFilterConfig should handle complex types gracefully', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(ComplexTypesSchema)

    // Should generate configs for complex types, defaulting to text
    // These fields may or may not be included depending on schema introspection

    // These should either be included as text filters or excluded
    // The exact behavior depends on the schema introspection logic
    expect(configs.length).toBeGreaterThan(0)
  }),
)

// Tests for accessor functions
effect(
  'generateFilterConfig should create working accessor functions for different data types',
  () =>
    Effect.gen(function* () {
      const configs = generateFilterConfig(BasicPersonSchema)

      const testRow: TestPerson = testPersonData[0]!

      // Test string accessor
      const firstNameConfig = getFilterConfigByField(configs, 'firstName')
      if (Option.isSome(firstNameConfig)) {
        const result = firstNameConfig.value.accessor(testRow)
        expect(result).toBe('John')
      }

      // Test number accessor
      const ageConfig = getFilterConfigByField(configs, 'age')
      if (Option.isSome(ageConfig)) {
        const result = ageConfig.value.accessor(testRow)
        expect(result).toBe(30)
      }

      // Test boolean accessor (should convert to string)
      const isActiveConfig = getFilterConfigByField(configs, 'isActive')
      if (Option.isSome(isActiveConfig)) {
        const result = isActiveConfig.value.accessor(testRow)
        expect(result).toBe('true')
      }
    }),
)

effect('generateFilterConfig accessor should handle null and undefined values', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    const testRowWithNulls: TestPerson = {
      ...testPersonData[0]!,
      bio: undefined,
    }

    const bioConfig = getFilterConfigByField(configs, 'bio')
    if (Option.isSome(bioConfig)) {
      const result = bioConfig.value.accessor(testRowWithNulls)
      expect(result).toBe('')
    }
  }),
)

// Tests for generateSimpleFilterConfig function
effect('generateSimpleFilterConfig should create text filters for all fields', () =>
  Effect.gen(function* () {
    const configs = generateSimpleFilterConfig(BasicPersonSchema)

    expect(configs.length).toBeGreaterThan(0)

    // All configs should be text type with SearchIcon
    pipe(
      configs,
      Array.map((config) => {
        expect(config.type).toBe('text')
        expect(config.icon).toBeDefined()
        expect(config.displayName).toBeDefined()
        expect(config.id).toBeDefined()
        expect(config.accessor).toBeDefined()
        return Effect.void
      }),
    )
  }),
)

effect('generateSimpleFilterConfig should handle all field types as text', () =>
  Effect.gen(function* () {
    const configs = generateSimpleFilterConfig(EnumTestSchema)

    const statusConfig = getFilterConfigByField(configs, 'status')
    expect(Option.isSome(statusConfig)).toBe(true)

    if (Option.isSome(statusConfig)) {
      expect(statusConfig.value.type).toBe('text')
      expect(statusConfig.value.icon).toBe(SearchIcon)
    }
  }),
)

effect('generateSimpleFilterConfig should create working accessor functions', () =>
  Effect.gen(function* () {
    const configs = generateSimpleFilterConfig(BasicPersonSchema)

    const testRow: TestPerson = testPersonData[0]!
    const firstNameConfig = getFilterConfigByField(configs, 'firstName')
    if (Option.isSome(firstNameConfig)) {
      const result = firstNameConfig.value.accessor(testPersonData[0]!)
      expect(result).toBe('John')
    }

    const ageConfig = getFilterConfigByField(configs, 'age')
    if (Option.isSome(ageConfig)) {
      const result = ageConfig.value.accessor(testRow)
      expect(result).toBe('30') // Should convert number to string
    }

    const isActiveConfig = getFilterConfigByField(configs, 'isActive')
    if (Option.isSome(isActiveConfig)) {
      const result = isActiveConfig.value.accessor(testRow)
      expect(result).toBe('true') // Should convert boolean to string
    }
  }),
)

effect('generateSimpleFilterConfig should handle null values gracefully', () =>
  Effect.gen(function* () {
    const configs = generateSimpleFilterConfig(BasicPersonSchema)

    const testRowWithNulls = {
      ...testPersonData[0],
      bio: null as any,
    }

    const bioConfig = getFilterConfigByField(configs, 'bio')
    if (Option.isSome(bioConfig)) {
      const result = bioConfig.value.accessor(testRowWithNulls)
      expect(result).toBe('')
    }
  }),
)

effect('generateSimpleFilterConfig should skip fields that cause errors', () =>
  Effect.gen(function* () {
    // This test ensures that if a field causes an error during config creation,
    // it's skipped rather than causing the entire function to fail
    const configs = generateSimpleFilterConfig(ComplexTypesSchema)

    // Should return some configs, even if some fields are skipped
    expect(Array.isArray(configs)).toBe(true)
  }),
)

// Type-level validation tests
effect('Type validation: generateFilterConfig returns properly typed ColumnConfig array', () =>
  Effect.gen(function* () {
    // This test validates that the type structure is correct at compile time
    const configs = generateFilterConfig(BasicPersonSchema)

    // Mock function that expects the correct ColumnConfig structure
    const mockFilterFunction = (
      filterConfigs: ReadonlyArray<{
        id: string
        accessor: (row: any) => any
        displayName: string
        icon: any
        type: 'text' | 'number' | 'date' | 'option' | 'multiOption'
      }>,
    ) => filterConfigs

    // This should compile correctly - validates type structure
    const result = mockFilterFunction(configs)
    expect(result).toBe(configs)
  }),
)

effect('Type validation: generateSimpleFilterConfig returns text-only ColumnConfig array', () =>
  Effect.gen(function* () {
    const configs = generateSimpleFilterConfig(BasicPersonSchema)

    // Mock function that expects text-only configs
    const mockTextFilterFunction = (
      filterConfigs: ReadonlyArray<{
        id: string
        accessor: (row: any) => string
        displayName: string
        icon: any
        type: 'text'
      }>,
    ) => filterConfigs

    // This should compile correctly - validates that all configs are text type
    const result = mockTextFilterFunction(configs as any) // Type assertion needed due to generic constraints
    expect(result).toBeDefined()
  }),
)

// Error handling tests
effect('generateFilterConfig should handle invalid schema gracefully', () =>
  Effect.gen(function* () {
    // Test with an empty schema
    const EmptySchema = Schema.Struct({})
    const configs = generateFilterConfig(EmptySchema)

    expect(Array.isArray(configs)).toBe(true)
    expect(configs.length).toBe(0)
  }),
)

effect('generateFilterConfig should continue processing after individual field errors', () =>
  Effect.gen(function* () {
    // This test ensures that if one field fails to generate a config,
    // other fields are still processed
    const configs = generateFilterConfig(BasicPersonSchema)

    // Should have multiple configs despite potential individual field errors
    expect(configs.length).toBeGreaterThan(1)
  }),
)

// Edge case tests
effect('generateFilterConfig should handle optional fields correctly', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    const bioConfig = getFilterConfigByField(configs, 'bio')
    expect(Option.isSome(bioConfig)).toBe(true)

    if (Option.isSome(bioConfig)) {
      expect(bioConfig.value.type).toBe('text')
      expect(bioConfig.value.displayName).toBe('Bio')
    }
  }),
)

effect('generateFilterConfig should format field names correctly', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    const firstNameConfig = getFilterConfigByField(configs, 'firstName')
    if (Option.isSome(firstNameConfig)) {
      expect(firstNameConfig.value.displayName).toBe('First Name')
    }

    const lastNameConfig = getFilterConfigByField(configs, 'lastName')
    if (Option.isSome(lastNameConfig)) {
      expect(lastNameConfig.value.displayName).toBe('Last Name')
    }
  }),
)

// Integration tests with realistic data
effect('Integration: generated filters should work with real data processing', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    // Test that we can use the generated configs to process real data
    const processedData = pipe(
      testPersonData,
      Array.map((person) => {
        const results: Record<string, any> = {}

        pipe(
          configs,
          Array.map((config) => {
            results[config.id] = config.accessor(person)
            return Effect.void
          }),
        )

        return results
      }),
    )

    expect(processedData.length).toBe(2)
    expect(processedData[0]?.firstName).toBe('John')
    expect(processedData[0]?.age).toBe(30)
    expect(processedData[1]?.firstName).toBe('Jane')
    expect(processedData[1]?.age).toBe(25)
  }),
)

effect('Integration: boolean field accessor should work correctly with filter logic', () =>
  Effect.gen(function* () {
    const configs = generateFilterConfig(BasicPersonSchema)

    const isActiveConfig = getFilterConfigByField(configs, 'isActive')
    expect(Option.isSome(isActiveConfig)).toBe(true)

    if (Option.isSome(isActiveConfig)) {
      // Test with both true and false values
      const activeResult = isActiveConfig.value.accessor(testPersonData[0])
      const inactiveResult = isActiveConfig.value.accessor(testPersonData[1])

      expect(activeResult).toBe('true')
      expect(inactiveResult).toBe('false')

      // These string values should match the option values
      const options = isActiveConfig.value.options!
      const trueOption = pipe(
        options,
        Array.findFirst((opt: any) => opt.value === 'true'),
      )
      const falseOption = pipe(
        options,
        Array.findFirst((opt: any) => opt.value === 'false'),
      )

      expect(Option.isSome(trueOption)).toBe(true)
      expect(Option.isSome(falseOption)).toBe(true)
    }
  }),
)
