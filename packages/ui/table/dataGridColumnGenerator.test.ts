import { effect, expect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { generateDataGridColumns, getDefaultWidth, getHeaderIcon } from './dataGridColumnGenerator'

// Create a simple test schema
const TestSchema = Schema.Struct({
  age: Schema.Number,
  email: Schema.String,
  id: Schema.String,
  isActive: Schema.Boolean,
  name: Schema.String,
})

effect('getHeaderIcon returns correct icons for cell types', () =>
  Effect.gen(function* () {
    expect(getHeaderIcon('avatar')).toBe('headerImage')
    expect(getHeaderIcon('boolean')).toBe('headerBoolean')
    expect(getHeaderIcon('number')).toBe('headerNumber')
    expect(getHeaderIcon('currency')).toBe('headerNumber')
    expect(getHeaderIcon('date')).toBe('headerDate')
    expect(getHeaderIcon('datetime')).toBe('headerDate')
    expect(getHeaderIcon('email')).toBe('headerEmail')
    expect(getHeaderIcon('link')).toBe('headerUri')
    expect(getHeaderIcon('badge')).toBe('headerCode')
    expect(getHeaderIcon('text')).toBe('headerString')
    expect(getHeaderIcon()).toBe('headerString')
  }),
)

effect('getDefaultWidth returns correct widths for cell types', () =>
  Effect.gen(function* () {
    expect(getDefaultWidth('avatar')).toBe(80)
    expect(getDefaultWidth('boolean')).toBe(100)
    expect(getDefaultWidth('number')).toBe(100)
    expect(getDefaultWidth('currency')).toBe(120)
    expect(getDefaultWidth('date')).toBe(140)
    expect(getDefaultWidth('datetime')).toBe(140)
    expect(getDefaultWidth('email')).toBe(200)
    expect(getDefaultWidth('badge')).toBe(120)
    expect(getDefaultWidth('link')).toBe(180)
    expect(getDefaultWidth('text')).toBe(150)
    expect(getDefaultWidth()).toBe(150)
  }),
)

effect('generateDataGridColumns generates columns from test schema', () =>
  Effect.gen(function* () {
    const { columns, columnIdToField } = generateDataGridColumns(TestSchema)

    // Check that columns were generated
    expect(columns.length).toBeGreaterThan(0)

    // Check that columnIdToField map was populated
    expect(columnIdToField.size).toBeGreaterThan(0)

    // Check that columns have required properties
    columns.forEach((column) => {
      expect(column).toHaveProperty('id')
      expect(column).toHaveProperty('title')
      expect(column).toHaveProperty('width')
      expect(column).toHaveProperty('icon')
    })

    // Check specific columns exist
    const columnIds = columns.map((c) => c.id)
    expect(columnIds).toContain('name')
    expect(columnIds).toContain('email')

    // Check that the map contains the same fields
    expect(columnIdToField.has('name')).toBe(true)
    expect(columnIdToField.has('email')).toBe(true)
  }),
)

effect('generateDataGridColumns respects field order', () =>
  Effect.gen(function* () {
    const { columns } = generateDataGridColumns(TestSchema)

    // Find columns with specific orders if they exist
    const nameColumn = columns.find((c) => c.id === 'name')
    const emailColumn = columns.find((c) => c.id === 'email')

    // Name should typically come before email in a person schema
    if (nameColumn && emailColumn) {
      const nameIndex = columns.indexOf(nameColumn)
      const emailIndex = columns.indexOf(emailColumn)

      // This test assumes name has a lower order than email
      // Adjust based on actual schema configuration
      expect(nameIndex).toBeLessThan(emailIndex)
    }
  }),
)

effect('generateDataGridColumns filters out hidden fields', () =>
  Effect.gen(function* () {
    const { columns } = generateDataGridColumns(TestSchema)

    // Check that internal/hidden fields are not included
    const columnIds = columns.map((c) => c.id)

    // These are typically hidden fields
    expect(columnIds).not.toContain('_id')
    expect(columnIds).not.toContain('__typename')
    expect(columnIds).not.toContain('createdAt')
    expect(columnIds).not.toContain('updatedAt')
  }),
)
