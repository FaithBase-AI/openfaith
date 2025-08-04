import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { autoDetectCellConfig, autoDetectFieldConfig } from '@openfaith/schema/shared/autoDetection'
import { Effect, Schema } from 'effect'

effect('autoDetectFieldConfig should return configuration object', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String
    const config = autoDetectFieldConfig(stringSchema.ast, 'email')
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  }),
)

effect('autoDetectFieldConfig should detect literal union as select', () =>
  Effect.gen(function* () {
    const statusSchema = Schema.Union(
      Schema.Literal('active'),
      Schema.Literal('inactive'),
      Schema.Literal('pending'),
    )
    const config = autoDetectFieldConfig(statusSchema.ast, 'status')
    expect(config).toBeDefined()
    expect(config).toHaveProperty('type', 'select')
    expect(config).toHaveProperty('options')
  }),
)

effect('autoDetectFieldConfig should detect date fields by name', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String

    const birthDateConfig = autoDetectFieldConfig(stringSchema.ast, 'birthDate')
    expect(birthDateConfig).toHaveProperty('type', 'date')

    const anniversaryConfig = autoDetectFieldConfig(stringSchema.ast, 'anniversary')
    expect(anniversaryConfig).toHaveProperty('type', 'date')
  }),
)

effect('autoDetectFieldConfig should detect password fields by name', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String
    const config = autoDetectFieldConfig(stringSchema.ast, 'password')
    expect(config).toHaveProperty('type', 'password')
  }),
)

effect('autoDetectFieldConfig should detect textarea fields by name', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String

    const bioConfig = autoDetectFieldConfig(stringSchema.ast, 'bio')
    expect(bioConfig).toHaveProperty('type', 'textarea')
    expect(bioConfig).toHaveProperty('rows', 3)

    const descriptionConfig = autoDetectFieldConfig(stringSchema.ast, 'description')
    expect(descriptionConfig).toHaveProperty('type', 'textarea')
  }),
)

effect('autoDetectFieldConfig should detect number fields', () =>
  Effect.gen(function* () {
    const numberSchema = Schema.Number
    const config = autoDetectFieldConfig(numberSchema.ast, 'age')
    expect(config).toHaveProperty('type', 'number')
  }),
)

effect('autoDetectFieldConfig should detect boolean fields as switch', () =>
  Effect.gen(function* () {
    const booleanSchema = Schema.Boolean
    const config = autoDetectFieldConfig(booleanSchema.ast, 'isActive')
    expect(config).toHaveProperty('type', 'switch')
  }),
)

effect('autoDetectCellConfig should return configuration object', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String
    const config = autoDetectCellConfig(stringSchema.ast, 'email')
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  }),
)

effect('autoDetectCellConfig should detect avatar fields by name', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String

    const avatarConfig = autoDetectCellConfig(stringSchema.ast, 'avatar')
    expect(avatarConfig).toHaveProperty('cellType', 'avatar')

    const imageConfig = autoDetectCellConfig(stringSchema.ast, 'image')
    expect(imageConfig).toHaveProperty('cellType', 'avatar')
  }),
)

effect('autoDetectCellConfig should detect link fields by name', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String

    const urlConfig = autoDetectCellConfig(stringSchema.ast, 'url')
    expect(urlConfig).toHaveProperty('cellType', 'link')

    const websiteConfig = autoDetectCellConfig(stringSchema.ast, 'website')
    expect(websiteConfig).toHaveProperty('cellType', 'link')
  }),
)

effect('autoDetectCellConfig should detect currency fields by name', () =>
  Effect.gen(function* () {
    const numberSchema = Schema.Number

    const priceConfig = autoDetectCellConfig(numberSchema.ast, 'price')
    expect(priceConfig).toHaveProperty('cellType', 'currency')

    const amountConfig = autoDetectCellConfig(numberSchema.ast, 'amount')
    expect(amountConfig).toHaveProperty('cellType', 'currency')
  }),
)

effect('autoDetectCellConfig should detect number cells', () =>
  Effect.gen(function* () {
    const numberSchema = Schema.Number
    const config = autoDetectCellConfig(numberSchema.ast, 'count')
    expect(config).toHaveProperty('cellType', 'number')
  }),
)

effect('autoDetectCellConfig should detect boolean cells', () =>
  Effect.gen(function* () {
    const booleanSchema = Schema.Boolean
    const config = autoDetectCellConfig(booleanSchema.ast, 'isActive')
    expect(config).toHaveProperty('cellType', 'boolean')
  }),
)

effect('autoDetectCellConfig should detect entity link fields only for exact "name" field', () =>
  Effect.gen(function* () {
    const stringSchema = Schema.String

    // Should detect as entityLink - only exact "name"
    const nameConfig = autoDetectCellConfig(stringSchema.ast, 'name')
    expect(nameConfig).toHaveProperty('cellType', 'entityLink')

    // Should NOT detect as entityLink (should be text)
    const fullNameConfig = autoDetectCellConfig(stringSchema.ast, 'fullName')
    expect(fullNameConfig).toHaveProperty('cellType', 'text')

    const displayNameConfig = autoDetectCellConfig(stringSchema.ast, 'displayName')
    expect(displayNameConfig).toHaveProperty('cellType', 'text')

    const titleConfig = autoDetectCellConfig(stringSchema.ast, 'title')
    expect(titleConfig).toHaveProperty('cellType', 'text')

    const firstNameConfig = autoDetectCellConfig(stringSchema.ast, 'firstName')
    expect(firstNameConfig).toHaveProperty('cellType', 'text')

    const lastNameConfig = autoDetectCellConfig(stringSchema.ast, 'lastName')
    expect(lastNameConfig).toHaveProperty('cellType', 'text')

    const userNameConfig = autoDetectCellConfig(stringSchema.ast, 'userName')
    expect(userNameConfig).toHaveProperty('cellType', 'text')
  }),
)
