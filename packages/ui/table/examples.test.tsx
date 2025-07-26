import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  AdvancedPersonTable,
  AutomaticPersonTable,
  CustomPersonTable,
  PersonWithTableSchema,
  SimplePersonTable,
  samplePeople,
} from '@openfaith/ui/table/examples'
import { Effect, SchemaAST } from 'effect'

effect('PersonWithTableSchema has correct structure', () =>
  Effect.gen(function* () {
    const ast = PersonWithTableSchema.ast
    expect(ast._tag).toBe('TypeLiteral')

    if (ast._tag === 'TypeLiteral') {
      expect(ast.propertySignatures).toHaveLength(9)

      const fieldNames = ast.propertySignatures.map((prop) => prop.name)
      expect(fieldNames).toContain('firstName')
      expect(fieldNames).toContain('lastName')
      expect(fieldNames).toContain('email')
      expect(fieldNames).toContain('age')
      expect(fieldNames).toContain('salary')
      expect(fieldNames).toContain('isActive')
      expect(fieldNames).toContain('avatar')
      expect(fieldNames).toContain('bio')
      expect(fieldNames).toContain('department')
    }
  }),
)

effect('PersonWithTableSchema firstName field has correct UI config', () =>
  Effect.gen(function* () {
    const ast = PersonWithTableSchema.ast
    if (ast._tag === 'TypeLiteral') {
      const firstNameField = ast.propertySignatures.find((prop) => prop.name === 'firstName')
      expect(firstNameField).toBeDefined()

      const uiConfig = SchemaAST.getAnnotation(OfUiConfig)(firstNameField!.type)
      expect(uiConfig._tag).toBe('Some')
      if (uiConfig._tag === 'Some') {
        const config = uiConfig.value as FieldConfig
        expect(config.table?.header).toBe('First Name')
        expect(config.table?.width).toBe(150)
      }
    }
  }),
)

effect('PersonWithTableSchema email field has email cell type', () =>
  Effect.gen(function* () {
    const ast = PersonWithTableSchema.ast
    if (ast._tag === 'TypeLiteral') {
      const emailField = ast.propertySignatures.find((prop) => prop.name === 'email')
      expect(emailField).toBeDefined()

      const uiConfig = SchemaAST.getAnnotation(OfUiConfig)(emailField!.type)
      expect(uiConfig._tag).toBe('Some')
      if (uiConfig._tag === 'Some') {
        const config = uiConfig.value as FieldConfig
        expect(config.table?.header).toBe('Email')
        expect(config.table?.width).toBe(200)
      }
    }
  }),
)

effect('PersonWithTableSchema salary field has currency cell type', () =>
  Effect.gen(function* () {
    const ast = PersonWithTableSchema.ast
    if (ast._tag === 'TypeLiteral') {
      const salaryField = ast.propertySignatures.find((prop) => prop.name === 'salary')
      expect(salaryField).toBeDefined()

      const uiConfig = SchemaAST.getAnnotation(OfUiConfig)(salaryField!.type)
      expect(uiConfig._tag).toBe('Some')
      if (uiConfig._tag === 'Some') {
        const config = uiConfig.value as FieldConfig
        expect(config.table?.cellType).toBe('currency')
        expect(config.table?.filterable).toBe(false)
      }
    }
  }),
)

effect('PersonWithTableSchema age field has correct UI config', () =>
  Effect.gen(function* () {
    const ast = PersonWithTableSchema.ast
    if (ast._tag === 'TypeLiteral') {
      const ageField = ast.propertySignatures.find((prop) => prop.name === 'age')
      expect(ageField).toBeDefined()

      const uiConfig = SchemaAST.getAnnotation(OfUiConfig)(ageField!.type)
      expect(uiConfig._tag).toBe('Some')
      if (uiConfig._tag === 'Some') {
        const config = uiConfig.value as FieldConfig
        expect(config.table?.header).toBe('Age')
        expect(config.table?.width).toBe(80)
        // cellType is auto-detected, not explicitly set
      }
    }
  }),
)

effect('PersonWithTableSchema isActive field has correct UI config', () =>
  Effect.gen(function* () {
    const ast = PersonWithTableSchema.ast
    if (ast._tag === 'TypeLiteral') {
      const isActiveField = ast.propertySignatures.find((prop) => prop.name === 'isActive')
      expect(isActiveField).toBeDefined()

      const uiConfig = SchemaAST.getAnnotation(OfUiConfig)(isActiveField!.type)
      expect(uiConfig._tag).toBe('Some')
      if (uiConfig._tag === 'Some') {
        const config = uiConfig.value as FieldConfig
        expect(config.table?.header).toBe('Status')
        expect(config.table?.width).toBe(100)
        // cellType is auto-detected, not explicitly set
      }
    }
  }),
)

effect('SimplePersonTable component is defined', () =>
  Effect.gen(function* () {
    expect(SimplePersonTable).toBeDefined()
    expect(typeof SimplePersonTable).toBe('function')
  }),
)

effect('AutomaticPersonTable component is defined', () =>
  Effect.gen(function* () {
    expect(AutomaticPersonTable).toBeDefined()
    expect(typeof AutomaticPersonTable).toBe('function')
  }),
)

effect('CustomPersonTable component is defined', () =>
  Effect.gen(function* () {
    expect(CustomPersonTable).toBeDefined()
    expect(typeof CustomPersonTable).toBe('function')
  }),
)

effect('AdvancedPersonTable component is defined', () =>
  Effect.gen(function* () {
    expect(AdvancedPersonTable).toBeDefined()
    expect(typeof AdvancedPersonTable).toBe('function')
  }),
)

effect('samplePeople contains valid data', () =>
  Effect.gen(function* () {
    expect(Array.isArray(samplePeople)).toBe(true)
    expect(samplePeople.length).toBeGreaterThan(0)

    // Check first person has all required fields
    const firstPerson = samplePeople[0]
    if (firstPerson) {
      expect(typeof firstPerson.firstName).toBe('string')
      expect(typeof firstPerson.lastName).toBe('string')
      expect(typeof firstPerson.email).toBe('string')
      expect(typeof firstPerson.age).toBe('number')
      expect(typeof firstPerson.isActive).toBe('boolean')
      expect(['Engineering', 'Sales', 'Marketing', 'HR']).toContain(firstPerson.department)
    }
  }),
)

effect('samplePeople contains variety of data types', () =>
  Effect.gen(function* () {
    // Check that we have both active and inactive people
    const activeCount = samplePeople.filter((person) => person.isActive).length
    const inactiveCount = samplePeople.filter((person) => !person.isActive).length

    expect(activeCount).toBeGreaterThan(0)
    expect(inactiveCount).toBeGreaterThan(0)

    // Check that we have different departments
    const departments = new Set(samplePeople.map((person) => person.department))
    expect(departments.size).toBeGreaterThan(1)

    // Check that ages vary
    const ages = samplePeople.map((person) => person.age)
    const uniqueAges = new Set(ages)
    expect(uniqueAges.size).toBeGreaterThan(1)
  }),
)

effect('samplePeople email addresses are valid', () =>
  Effect.gen(function* () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    for (const person of samplePeople) {
      expect(emailRegex.test(person.email)).toBe(true)
    }
  }),
)

effect('samplePeople salaries are reasonable', () =>
  Effect.gen(function* () {
    for (const person of samplePeople) {
      // Some salaries can be null, so only check non-null values
      if (person.salary !== null) {
        expect(person.salary).toBeGreaterThan(0)
        expect(person.salary).toBeLessThan(1000000) // Less than $1M
      }
    }
  }),
)

effect('samplePeople ages are reasonable', () =>
  Effect.gen(function* () {
    for (const person of samplePeople) {
      expect(person.age).toBeGreaterThanOrEqual(18)
      expect(person.age).toBeLessThanOrEqual(80)
    }
  }),
)
