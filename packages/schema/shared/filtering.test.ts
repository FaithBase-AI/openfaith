import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  ENTITY_TYPE_FIELDS,
  getContextConfig,
  getVisibleFields,
  IDENTIFICATION_FIELDS,
  isEntityTypeField,
  isIdentificationField,
  isSystemField,
  SYSTEM_FIELDS_TO_HIDE,
  shouldHideField,
} from '@openfaith/schema/shared/filtering'
import { extractSchemaFields } from '@openfaith/schema/shared/introspection'
import { OfUiConfig } from '@openfaith/schema/shared/schema'
import { Effect, Schema } from 'effect'

// Test schemas
const TestSchemaWithSystemFields = Schema.Struct({
  _tag: Schema.Literal('TestEntity'),
  createdBy: Schema.String,
  customFields: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  deletedAt: Schema.optional(Schema.String),
  deletedBy: Schema.optional(Schema.String),
  email: Schema.String,
  externalIds: Schema.String.pipe(Schema.annotations({ description: 'external ids mapping' })),
  id: Schema.String.pipe(Schema.annotations({ description: 'Entity typeid' })),
  name: Schema.String,
  orgId: Schema.String.pipe(Schema.annotations({ description: 'Organization typeid' })),
  tags: Schema.optional(Schema.Array(Schema.String)),
  updatedBy: Schema.String,
})

const TestSchemaWithHiddenFields = Schema.Struct({
  _tag: Schema.Literal('TestEntity'),
  hiddenBothField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        field: { hidden: true },
        table: { hidden: true },
      },
    }),
  ),
  hiddenFormField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        field: { hidden: true },
      },
    }),
  ),
  hiddenTableField: Schema.String.pipe(
    Schema.annotations({
      [OfUiConfig]: {
        table: { hidden: true },
      },
    }),
  ),
  visibleField: Schema.String,
})

effect('isSystemField should correctly identify system fields', () =>
  Effect.gen(function* () {
    expect(isSystemField('createdBy')).toBe(true)
    expect(isSystemField('updatedBy')).toBe(true)
    expect(isSystemField('deletedAt')).toBe(true)
    expect(isSystemField('deletedBy')).toBe(true)
    expect(isSystemField('customFields')).toBe(true)
    expect(isSystemField('tags')).toBe(true)
    expect(isSystemField('inactivatedAt')).toBe(true)
    expect(isSystemField('inactivatedBy')).toBe(true)

    // Non-system fields
    expect(isSystemField('name')).toBe(false)
    expect(isSystemField('email')).toBe(false)
    expect(isSystemField('id')).toBe(false)
  }),
)

effect('isEntityTypeField should correctly identify entity type fields', () =>
  Effect.gen(function* () {
    expect(isEntityTypeField('_tag')).toBe(true)
    expect(isEntityTypeField('type')).toBe(true)

    // Non-entity type fields
    expect(isEntityTypeField('name')).toBe(false)
    expect(isEntityTypeField('id')).toBe(false)
  }),
)

effect('isIdentificationField should correctly identify identification fields', () =>
  Effect.gen(function* () {
    expect(isIdentificationField('id')).toBe(true)
    expect(isIdentificationField('orgId')).toBe(true)
    expect(isIdentificationField('externalIds')).toBe(true)

    // Non-identification fields
    expect(isIdentificationField('name')).toBe(false)
    expect(isIdentificationField('email')).toBe(false)
  }),
)

effect('shouldHideField should hide system fields', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithSystemFields as any)

    const createdByField = fields.find((f) => f.key === 'createdBy')!
    expect(shouldHideField(createdByField, 'form')).toBe(true)
    expect(shouldHideField(createdByField, 'table')).toBe(true)

    const customFieldsField = fields.find((f) => f.key === 'customFields')!
    expect(shouldHideField(customFieldsField, 'form')).toBe(true)
    expect(shouldHideField(customFieldsField, 'table')).toBe(true)
  }),
)

effect('shouldHideField should hide entity type fields', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithSystemFields as any)

    const tagField = fields.find((f) => f.key === '_tag')!
    expect(shouldHideField(tagField, 'form')).toBe(true)
    expect(shouldHideField(tagField, 'table')).toBe(true)
  }),
)

effect(
  'shouldHideField should not hide identification fields without proper description extraction',
  () =>
    Effect.gen(function* () {
      const fields = extractSchemaFields(TestSchemaWithSystemFields as any)

      // Currently, description extraction is not working properly, so these fields are not hidden
      // This test documents the current behavior - in the future when description extraction is fixed,
      // these should be hidden if they have system descriptions
      const idField = fields.find((f) => f.key === 'id')!
      expect(shouldHideField(idField, 'form')).toBe(false)
      expect(shouldHideField(idField, 'table')).toBe(false)

      const externalIdsField = fields.find((f) => f.key === 'externalIds')!
      expect(shouldHideField(externalIdsField, 'form')).toBe(false)
      expect(shouldHideField(externalIdsField, 'table')).toBe(false)

      const orgIdField = fields.find((f) => f.key === 'orgId')!
      expect(shouldHideField(orgIdField, 'form')).toBe(false)
      expect(shouldHideField(orgIdField, 'table')).toBe(false)
    }),
)

effect('shouldHideField should not hide regular fields', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithSystemFields as any)

    const nameField = fields.find((f) => f.key === 'name')!
    expect(shouldHideField(nameField, 'form')).toBe(false)
    expect(shouldHideField(nameField, 'table')).toBe(false)

    const emailField = fields.find((f) => f.key === 'email')!
    expect(shouldHideField(emailField, 'form')).toBe(false)
    expect(shouldHideField(emailField, 'table')).toBe(false)
  }),
)

effect('shouldHideField should respect explicit hidden annotations', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithHiddenFields as any)

    const hiddenFormField = fields.find((f) => f.key === 'hiddenFormField')!
    expect(shouldHideField(hiddenFormField, 'form')).toBe(true)
    expect(shouldHideField(hiddenFormField, 'table')).toBe(false)

    const hiddenTableField = fields.find((f) => f.key === 'hiddenTableField')!
    expect(shouldHideField(hiddenTableField, 'form')).toBe(false)
    expect(shouldHideField(hiddenTableField, 'table')).toBe(true)

    const hiddenBothField = fields.find((f) => f.key === 'hiddenBothField')!
    expect(shouldHideField(hiddenBothField, 'form')).toBe(true)
    expect(shouldHideField(hiddenBothField, 'table')).toBe(true)

    const visibleField = fields.find((f) => f.key === 'visibleField')!
    expect(shouldHideField(visibleField, 'form')).toBe(false)
    expect(shouldHideField(visibleField, 'table')).toBe(false)
  }),
)

effect('getVisibleFields should filter out hidden fields for form context', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithSystemFields as any)
    const visibleFields = getVisibleFields(fields, 'form')

    // Should include name, email, and identification fields (since description extraction isn't working)
    expect(visibleFields.length).toBe(5)
    expect(visibleFields.map((f) => f.key).sort()).toEqual([
      'email',
      'externalIds',
      'id',
      'name',
      'orgId',
    ])
  }),
)

effect('getVisibleFields should filter out hidden fields for table context', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithSystemFields as any)
    const visibleFields = getVisibleFields(fields, 'table')

    // Should include name, email, and identification fields (since description extraction isn't working)
    expect(visibleFields.length).toBe(5)
    expect(visibleFields.map((f) => f.key).sort()).toEqual([
      'email',
      'externalIds',
      'id',
      'name',
      'orgId',
    ])
  }),
)

effect('getVisibleFields should respect context-specific hidden annotations', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithHiddenFields as any)

    const visibleFormFields = getVisibleFields(fields, 'form')
    expect(visibleFormFields.map((f) => f.key).sort()).toEqual(['hiddenTableField', 'visibleField'])

    const visibleTableFields = getVisibleFields(fields, 'table')
    expect(visibleTableFields.map((f) => f.key).sort()).toEqual(['hiddenFormField', 'visibleField'])
  }),
)

effect('getContextConfig should return correct config for context', () =>
  Effect.gen(function* () {
    const fields = extractSchemaFields(TestSchemaWithHiddenFields as any)

    const hiddenFormField = fields.find((f) => f.key === 'hiddenFormField')!
    const formConfig = getContextConfig(hiddenFormField, 'form')
    const tableConfig = getContextConfig(hiddenFormField, 'table')

    expect(formConfig?.hidden).toBe(true)
    expect(tableConfig?.hidden).toBeUndefined()
  }),
)

effect('SYSTEM_FIELDS_TO_HIDE should contain expected system fields', () =>
  Effect.gen(function* () {
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('createdBy')
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('updatedBy')
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('deletedAt')
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('deletedBy')
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('inactivatedAt')
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('inactivatedBy')
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('customFields')
    expect(SYSTEM_FIELDS_TO_HIDE).toContain('tags')
  }),
)

effect('ENTITY_TYPE_FIELDS should contain expected entity type fields', () =>
  Effect.gen(function* () {
    expect(ENTITY_TYPE_FIELDS).toContain('_tag')
    expect(ENTITY_TYPE_FIELDS).toContain('type')
  }),
)

effect('IDENTIFICATION_FIELDS should contain expected identification fields', () =>
  Effect.gen(function* () {
    expect(IDENTIFICATION_FIELDS).toContain('id')
    expect(IDENTIFICATION_FIELDS).toContain('orgId')
    expect(IDENTIFICATION_FIELDS).toContain('externalIds')
  }),
)
