import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import type { ExtractedField } from '@openfaith/ui/form/schemaIntrospection'
import { Effect, Schema } from 'effect'
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
} from './fieldFiltering'

// Helper to create mock ExtractedField
const createMockField = (
  key: string,
  annotations: FieldConfig = {},
  description?: string,
): ExtractedField => ({
  isNullable: false,
  isOptional: false,
  key,
  schema: {
    annotations: {
      [OfUiConfig]: annotations,
      ...(description && { description }),
    },
    name: key,
    type: Schema.String.ast,
  } as any,
})

effect('isSystemField - correctly identifies system fields', () =>
  Effect.gen(function* () {
    // Test all system fields
    for (const systemField of SYSTEM_FIELDS_TO_HIDE) {
      expect(isSystemField(systemField)).toBe(true)
    }

    // Test non-system fields
    expect(isSystemField('firstName')).toBe(false)
    expect(isSystemField('lastName')).toBe(false)
    expect(isSystemField('email')).toBe(false)
  }),
)

effect('isEntityTypeField - correctly identifies entity type fields', () =>
  Effect.gen(function* () {
    // Test all entity type fields
    for (const entityField of ENTITY_TYPE_FIELDS) {
      expect(isEntityTypeField(entityField)).toBe(true)
    }

    // Test non-entity type fields
    expect(isEntityTypeField('firstName')).toBe(false)
    expect(isEntityTypeField('lastName')).toBe(false)
  }),
)

effect('isIdentificationField - correctly identifies identification fields', () =>
  Effect.gen(function* () {
    // Test all identification fields
    for (const idField of IDENTIFICATION_FIELDS) {
      expect(isIdentificationField(idField)).toBe(true)
    }

    // Test non-identification fields
    expect(isIdentificationField('firstName')).toBe(false)
    expect(isIdentificationField('lastName')).toBe(false)
  }),
)

effect('shouldHideField - explicit table hidden annotation', () =>
  Effect.gen(function* () {
    const field = createMockField('testField', {
      table: { hidden: true },
    })

    const result = shouldHideField(field, 'table')
    expect(result).toBe(true)
  }),
)

effect('shouldHideField - explicit form hidden annotation', () =>
  Effect.gen(function* () {
    const field = createMockField('testField', {
      field: { hidden: true },
    })

    const result = shouldHideField(field, 'form')
    expect(result).toBe(true)
  }),
)

effect('shouldHideField - context-specific hidden annotation', () =>
  Effect.gen(function* () {
    const field = createMockField('testField', {
      table: { hidden: true },
    })

    // Should be hidden in table context
    expect(shouldHideField(field, 'table')).toBe(true)
    // Should be visible in form context
    expect(shouldHideField(field, 'form')).toBe(false)
  }),
)

effect('shouldHideField - system fields are always hidden', () =>
  Effect.gen(function* () {
    for (const systemField of SYSTEM_FIELDS_TO_HIDE) {
      const field = createMockField(systemField)

      expect(shouldHideField(field, 'table')).toBe(true)
      expect(shouldHideField(field, 'form')).toBe(true)
    }
  }),
)

effect('shouldHideField - entity type fields are always hidden', () =>
  Effect.gen(function* () {
    for (const entityField of ENTITY_TYPE_FIELDS) {
      const field = createMockField(entityField)

      expect(shouldHideField(field, 'table')).toBe(true)
      expect(shouldHideField(field, 'form')).toBe(true)
    }
  }),
)

effect('shouldHideField - identification fields with system descriptions', () =>
  Effect.gen(function* () {
    // Test with typeid description
    const idField = createMockField('id', {}, 'The typeid for the record')
    expect(shouldHideField(idField, 'table')).toBe(true)
    expect(shouldHideField(idField, 'form')).toBe(true)

    // Test with external ids description
    const externalField = createMockField('externalIds', {}, 'The external ids for the record')
    expect(shouldHideField(externalField, 'table')).toBe(true)
    expect(shouldHideField(externalField, 'form')).toBe(true)

    // Test orgId with typeid description
    const orgIdField = createMockField('orgId', {}, 'The typeid for the organization')
    expect(shouldHideField(orgIdField, 'table')).toBe(true)
    expect(shouldHideField(orgIdField, 'form')).toBe(true)
  }),
)

effect(
  'shouldHideField - identification fields without system descriptions should be visible',
  () =>
    Effect.gen(function* () {
      // Custom id field without system description
      const customIdField = createMockField('id', {}, 'Custom identifier')
      expect(shouldHideField(customIdField, 'table')).toBe(false)
      expect(shouldHideField(customIdField, 'form')).toBe(false)

      // orgId without system description
      const customOrgField = createMockField('orgId', {}, 'Organization reference')
      expect(shouldHideField(customOrgField, 'table')).toBe(false)
      expect(shouldHideField(customOrgField, 'form')).toBe(false)
    }),
)

effect('shouldHideField - regular fields should be visible', () =>
  Effect.gen(function* () {
    const field = createMockField('firstName')

    expect(shouldHideField(field, 'table')).toBe(false)
    expect(shouldHideField(field, 'form')).toBe(false)
  }),
)

effect('shouldHideField - precedence of hiding rules', () =>
  Effect.gen(function* () {
    // Explicit annotation should override system field detection
    const systemFieldWithExplicitShow = createMockField('createdBy', {})

    // System field rules take precedence over explicit annotations
    expect(shouldHideField(systemFieldWithExplicitShow, 'table')).toBe(true)
    expect(shouldHideField(systemFieldWithExplicitShow, 'form')).toBe(true)
  }),
)

effect('getVisibleFields - filters out hidden fields correctly', () =>
  Effect.gen(function* () {
    const fields = [
      createMockField('firstName'), // visible
      createMockField('lastName'), // visible
      createMockField('createdBy'), // system field - hidden
      createMockField('_tag'), // entity type - hidden
      createMockField('hiddenTableField', { table: { hidden: true } }), // explicitly hidden in table
      createMockField('hiddenFormField', { field: { hidden: true } }), // explicitly hidden in form
      createMockField('id', {}, 'The typeid for the record'), // system id - hidden
      createMockField('customId', {}, 'Custom identifier'), // custom id - visible
    ]

    const visibleTableFields = getVisibleFields(fields, 'table')
    const visibleFormFields = getVisibleFields(fields, 'form')

    // Table should exclude: createdBy, _tag, hiddenTableField, id
    expect(visibleTableFields).toHaveLength(4)
    expect(visibleTableFields.map((f) => f.key)).toEqual([
      'firstName',
      'lastName',
      'hiddenFormField',
      'customId',
    ])

    // Form should exclude: createdBy, _tag, hiddenFormField, id
    expect(visibleFormFields).toHaveLength(4)
    expect(visibleFormFields.map((f) => f.key)).toEqual([
      'firstName',
      'lastName',
      'hiddenTableField',
      'customId',
    ])
  }),
)

effect('getContextConfig - returns correct config for context', () =>
  Effect.gen(function* () {
    const field = createMockField('testField', {
      field: { required: true, type: 'email' },
      table: { hidden: true, sortable: false },
    })

    const tableConfig = getContextConfig(field, 'table')
    const formConfig = getContextConfig(field, 'form')

    expect(tableConfig).toEqual({ hidden: true, sortable: false })
    expect(formConfig).toEqual({ required: true, type: 'email' })
  }),
)

effect('getContextConfig - returns undefined when no config exists', () =>
  Effect.gen(function* () {
    const field = createMockField('testField')

    const tableConfig = getContextConfig(field, 'table')
    const formConfig = getContextConfig(field, 'form')

    expect(tableConfig).toBeUndefined()
    expect(formConfig).toBeUndefined()
  }),
)

effect('getContextConfig - handles partial configs', () =>
  Effect.gen(function* () {
    const fieldWithTableOnly = createMockField('testField', {
      table: { sortable: true },
    })

    const fieldWithFormOnly = createMockField('testField2', {
      field: { type: 'password' },
    })

    expect(getContextConfig(fieldWithTableOnly, 'table')).toEqual({
      sortable: true,
    })
    expect(getContextConfig(fieldWithTableOnly, 'form')).toBeUndefined()

    expect(getContextConfig(fieldWithFormOnly, 'table')).toBeUndefined()
    expect(getContextConfig(fieldWithFormOnly, 'form')).toEqual({
      type: 'password',
    })
  }),
)

// Integration test simulating real schema usage
effect('Integration test - Person-like schema field filtering', () =>
  Effect.gen(function* () {
    // Simulate fields from a Person schema
    const mockPersonFields = [
      createMockField('name'), // visible
      createMockField('firstName'), // visible
      createMockField('lastName'), // visible
      createMockField('email'), // visible
      createMockField('id', {}, 'The typeid for the record'), // hidden - system
      createMockField('orgId', {}, 'The typeid for the organization'), // hidden - system
      createMockField('externalIds', {}, 'The external ids for the record'), // hidden - system
      createMockField('createdAt'), // visible - not in SYSTEM_FIELDS_TO_HIDE
      createMockField('createdBy'), // hidden - system
      createMockField('updatedAt'), // visible - not in SYSTEM_FIELDS_TO_HIDE
      createMockField('_tag'), // hidden - entity type
      createMockField('type'), // hidden - entity type
      createMockField('customFields'), // hidden - system
      createMockField('avatar', { field: { hidden: true } }), // hidden - explicit
    ]

    const visibleFormFields = getVisibleFields(mockPersonFields, 'form')
    const visibleTableFields = getVisibleFields(mockPersonFields, 'table')

    // Should show user-facing fields plus createdAt and updatedAt (which are visible in tables)
    const expectedVisibleFields = [
      'name',
      'firstName',
      'lastName',
      'email',
      'createdAt',
      'updatedAt',
    ]

    expect(visibleFormFields).toHaveLength(6)
    expect(visibleFormFields.map((f) => f.key)).toEqual(expectedVisibleFields)

    // Table should show avatar (not explicitly hidden in table context)
    const expectedTableFields = [
      'name',
      'firstName',
      'lastName',
      'email',
      'createdAt',
      'updatedAt',
      'avatar',
    ]
    expect(visibleTableFields).toHaveLength(7)
    expect(visibleTableFields.map((f) => f.key)).toEqual(expectedTableFields)
  }),
)

effect('Edge cases - empty fields array', () =>
  Effect.gen(function* () {
    const emptyFields: Array<ExtractedField> = []

    const visibleTableFields = getVisibleFields(emptyFields, 'table')
    const visibleFormFields = getVisibleFields(emptyFields, 'form')

    expect(visibleTableFields).toHaveLength(0)
    expect(visibleFormFields).toHaveLength(0)
  }),
)

effect('Edge cases - field with no annotations', () =>
  Effect.gen(function* () {
    const fieldWithNoAnnotations: ExtractedField = {
      isNullable: false,
      isOptional: false,
      key: 'plainField',
      schema: {
        annotations: {},
        name: 'plainField',
        type: Schema.String.ast,
      } as any,
    }

    expect(shouldHideField(fieldWithNoAnnotations, 'table')).toBe(false)
    expect(shouldHideField(fieldWithNoAnnotations, 'form')).toBe(false)
    expect(getContextConfig(fieldWithNoAnnotations, 'table')).toBeUndefined()
    expect(getContextConfig(fieldWithNoAnnotations, 'form')).toBeUndefined()
  }),
)
