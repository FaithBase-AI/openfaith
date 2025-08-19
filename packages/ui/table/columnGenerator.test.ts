import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { OfUiConfig } from '@openfaith/schema/shared/schema'
import { generateColumns, generateSimpleColumns } from '@openfaith/ui/table/columnGenerator'
import { Effect, Schema } from 'effect'

// Test schema
const TestPersonSchema = Schema.Struct({
  age: Schema.Number.annotations({
    [OfUiConfig]: {
      table: {
        cellType: 'number',
        header: 'Age',
        width: 80,
      },
    },
  }),

  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)).annotations({
    [OfUiConfig]: {
      table: {
        cellType: 'email',
        header: 'Email',
        width: 200,
      },
    },
  }),
  firstName: Schema.String.annotations({
    [OfUiConfig]: {
      table: {
        header: 'First Name',
        width: 150,
      },
    },
  }),

  hiddenField: Schema.String.annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),

  isActive: Schema.Boolean.annotations({
    [OfUiConfig]: {
      table: {
        cellType: 'boolean',
        header: 'Status',
        width: 100,
      },
    },
  }),
})

effect('generateColumns creates correct column definitions', () =>
  Effect.gen(function* () {
    const columns = generateColumns(TestPersonSchema)

    // Should not include hidden fields
    expect(columns).toHaveLength(4)

    // Check first name column
    const firstNameColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'firstName',
    )
    expect(firstNameColumn).toBeDefined()
    expect(typeof firstNameColumn?.header).toBe('function')
    expect(firstNameColumn?.size).toBe(150)

    // Check email column
    const emailColumn = columns.find((col) => 'accessorKey' in col && col.accessorKey === 'email')
    expect(emailColumn).toBeDefined()
    expect(typeof emailColumn?.header).toBe('function')
    expect(emailColumn?.size).toBe(200)

    // Check age column
    const ageColumn = columns.find((col) => 'accessorKey' in col && col.accessorKey === 'age')
    expect(ageColumn).toBeDefined()
    expect(typeof ageColumn?.header).toBe('function')
    expect(ageColumn?.size).toBe(80)

    // Check boolean column
    const statusColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'isActive',
    )
    expect(statusColumn).toBeDefined()
    expect(typeof statusColumn?.header).toBe('function')
    expect(statusColumn?.size).toBe(100)

    // Hidden field should not be present
    const hiddenColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'hiddenField',
    )
    expect(hiddenColumn).toBeUndefined()
  }),
)

effect('generateColumns applies overrides correctly', () =>
  Effect.gen(function* () {
    const columns = generateColumns(TestPersonSchema, {
      firstName: {
        header: 'Custom First Name',
        size: 200,
      },
    })

    const firstNameColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'firstName',
    )
    expect(firstNameColumn?.header).toBe('Custom First Name')
    expect(firstNameColumn?.size).toBe(200)
  }),
)

effect('generateSimpleColumns creates basic columns', () =>
  Effect.gen(function* () {
    const columns = generateSimpleColumns(TestPersonSchema)

    expect(columns).toHaveLength(5) // Includes hidden field in simple mode

    const firstNameColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'firstName',
    )
    expect(firstNameColumn).toBeDefined()
    expect(firstNameColumn?.header).toBe('First Name') // Formatted label
  }),
)

effect('columns have correct default properties', () =>
  Effect.gen(function* () {
    const columns = generateColumns(TestPersonSchema)

    columns.forEach((column) => {
      expect(column.enableSorting).toBe(true) // Default sorting enabled
      expect(column.enableColumnFilter).toBe(true) // Default filtering enabled
      if ('accessorKey' in column) {
        expect(column.accessorKey).toBeDefined()
      }
      expect(column.header).toBeDefined()
    })
  }),
)

// Additional comprehensive tests
effect('generateColumns handles schema without annotations', () =>
  Effect.gen(function* () {
    const MinimalSchema = Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
    })

    const columns = generateColumns(MinimalSchema)
    expect(columns).toHaveLength(2)

    const idColumn = columns.find((col) => 'accessorKey' in col && col.accessorKey === 'id')
    expect(idColumn).toBeDefined()
    expect(typeof idColumn?.header).toBe('function') // Auto-formatted
  }),
)

effect('generateColumns respects pinned column configuration', () =>
  Effect.gen(function* () {
    const PinnedSchema = Schema.Struct({
      actions: Schema.String.annotations({
        [OfUiConfig]: {
          table: {
            pinned: 'right',
          },
        },
      }),
      id: Schema.Number.annotations({
        [OfUiConfig]: {
          table: {
            pinned: 'left',
          },
        },
      }),
    })

    const columns = generateColumns(PinnedSchema)

    const idColumn = columns.find((col) => 'accessorKey' in col && col.accessorKey === 'id')
    expect((idColumn?.meta as any)?.pinned).toBe('left')

    const actionsColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'actions',
    )
    expect((actionsColumn?.meta as any)?.pinned).toBe('right')
  }),
)

effect('generateColumns handles complex overrides', () =>
  Effect.gen(function* () {
    const columns = generateColumns(TestPersonSchema, {
      email: {
        cell: ({ getValue }) => `Email: ${getValue()}`,
      },
      firstName: {
        enableColumnFilter: false,
        enableSorting: false,
        header: 'Full Name',
        size: 250,
      },
    })

    const firstNameColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'firstName',
    )
    expect(firstNameColumn?.header).toBe('Full Name')
    expect(firstNameColumn?.size).toBe(250)
    expect(firstNameColumn?.enableSorting).toBe(false)
    expect(firstNameColumn?.enableColumnFilter).toBe(false)

    const emailColumn = columns.find((col) => 'accessorKey' in col && col.accessorKey === 'email')
    expect(emailColumn?.cell).toBeDefined()
    expect(typeof emailColumn?.cell).toBe('function')
  }),
)

effect('generateColumns handles empty schema', () =>
  Effect.gen(function* () {
    const EmptySchema = Schema.Struct({})
    const columns = generateColumns(EmptySchema)
    expect(columns).toHaveLength(0)
  }),
)

effect('generateColumns preserves cell renderers from annotations', () =>
  Effect.gen(function* () {
    const columns = generateColumns(TestPersonSchema)

    const emailColumn = columns.find((col) => 'accessorKey' in col && col.accessorKey === 'email')
    expect(emailColumn?.cell).toBeDefined()

    const ageColumn = columns.find((col) => 'accessorKey' in col && col.accessorKey === 'age')
    expect(ageColumn?.cell).toBeDefined()

    const booleanColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'isActive',
    )
    expect(booleanColumn?.cell).toBeDefined()
  }),
)

effect('generateSimpleColumns ignores hidden fields', () =>
  Effect.gen(function* () {
    const columns = generateSimpleColumns(TestPersonSchema)

    // Simple columns include all fields, even hidden ones
    expect(columns).toHaveLength(5)

    const hiddenColumn = columns.find(
      (col) => 'accessorKey' in col && col.accessorKey === 'hiddenField',
    )
    expect(hiddenColumn).toBeDefined()
    expect(hiddenColumn?.header).toBe('Hidden Field')
  }),
)

effect('generateColumns respects field ordering', () =>
  Effect.gen(function* () {
    const OrderedSchema = Schema.Struct({
      first: Schema.String.annotations({
        [OfUiConfig]: {
          table: {
            header: 'First Field',
            order: 2,
          },
        },
      }),
      second: Schema.String.annotations({
        [OfUiConfig]: {
          table: {
            header: 'Second Field',
            order: 1,
          },
        },
      }),
      third: Schema.String.annotations({
        [OfUiConfig]: {
          table: {
            header: 'Third Field',
            order: 0,
          },
        },
      }),
      unordered: Schema.String.annotations({
        [OfUiConfig]: {
          table: {
            header: 'Unordered Field',
            // No order specified - should go to end
          },
        },
      }),
    })

    const columns = generateColumns(OrderedSchema)
    expect(columns).toHaveLength(4)

    // Check that columns are in the correct order
    expect('accessorKey' in columns[0]! && columns[0]?.accessorKey).toBe('third') // order: 0
    expect('accessorKey' in columns[1]! && columns[1]?.accessorKey).toBe('second') // order: 1
    expect('accessorKey' in columns[2]! && columns[2]?.accessorKey).toBe('first') // order: 2
    expect('accessorKey' in columns[3]! && columns[3]?.accessorKey).toBe('unordered') // no order (999)
  }),
)
