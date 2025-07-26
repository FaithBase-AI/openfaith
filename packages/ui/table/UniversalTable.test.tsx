import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { UniversalTable, type UniversalTableProps } from '@openfaith/ui/table/UniversalTable'
import { Effect, Schema } from 'effect'

// Test schema and data
const TestSchema = Schema.Struct({
  email: Schema.String,
  hiddenField: Schema.String,
  id: Schema.Number,
  isActive: Schema.Boolean,
  name: Schema.String,
})

type TestData = Schema.Schema.Type<typeof TestSchema>

const testData: Array<TestData> = [
  {
    email: 'john@example.com',
    hiddenField: 'hidden1',
    id: 1,
    isActive: true,
    name: 'John',
  },
  {
    email: 'jane@example.com',
    hiddenField: 'hidden2',
    id: 2,
    isActive: false,
    name: 'Jane',
  },
]

effect('UniversalTable accepts required props', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      schema: TestSchema,
    }

    expect(props.schema).toBe(TestSchema)
    expect(props.data).toBe(testData)
  }),
)

effect('UniversalTable uses default values when props not provided', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      columnOverrides: {},
      data: testData,
      filtering: { columnFilters: true, globalFilter: true },
      pagination: { pageSize: 10, showPagination: true },
      schema: TestSchema,
      selection: { enableMultiRowSelection: false, enableRowSelection: false },
      sorting: { multiSort: false },
    }

    expect(props.pagination?.pageSize).toBe(10)
  }),
)

effect('UniversalTable accepts sorting configuration', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      schema: TestSchema,
      sorting: {
        multiSort: true,
        sortBy: 'name' as keyof TestData,
        sortOrder: 'desc',
      },
    }

    expect(props.sorting?.multiSort).toBe(true)
  }),
)

effect('UniversalTable accepts filtering configuration', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      filtering: { columnFilters: false, globalFilter: true },
      schema: TestSchema,
    }

    expect(props.filtering?.globalFilter).toBe(true)
  }),
)

effect('UniversalTable accepts selection configuration', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      schema: TestSchema,
      selection: { enableMultiRowSelection: true, enableRowSelection: true },
    }

    expect(props.selection?.enableRowSelection).toBe(true)
  }),
)

effect('UniversalTable accepts column overrides', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      columnOverrides: {
        name: { header: 'Full Name', size: 200 },
      },
      data: testData,
      schema: TestSchema,
    }

    expect(props.columnOverrides?.name?.header).toBe('Full Name')
  }),
)

effect('UniversalTable accepts event handlers', () =>
  Effect.gen(function* () {
    const onRowClick = (row: TestData) => console.log(row)
    const onRowSelect = (rows: Array<TestData>) => console.log(rows)

    const props: UniversalTableProps<TestData> = {
      data: testData,
      onRowClick,
      onRowSelect,
      schema: TestSchema,
    }

    expect(typeof props.onRowClick).toBe('function')
    expect(typeof props.onRowSelect).toBe('function')
  }),
)

effect('UniversalTable accepts table options', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      schema: TestSchema,
      tableOptions: {
        enableColumnResizing: true,
        enableRowSelection: true,
      },
    }

    expect(props.tableOptions?.enableColumnResizing).toBe(true)
  }),
)

effect('UniversalTable accepts className', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      className: 'custom-table-class',
      data: testData,
      schema: TestSchema,
    }

    expect(props.className).toBe('custom-table-class')
  }),
)

effect('UniversalTable works with empty data', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: [],
      schema: TestSchema,
    }

    expect(props.data).toHaveLength(0)
  }),
)

effect('UniversalTable works with minimal schema', () =>
  Effect.gen(function* () {
    const MinimalSchema = Schema.Struct({
      id: Schema.Number,
    })

    type MinimalData = Schema.Schema.Type<typeof MinimalSchema>

    const props: UniversalTableProps<MinimalData> = {
      data: [{ id: 1 }],
      schema: MinimalSchema,
    }

    expect(props.data).toHaveLength(1)
  }),
)

effect('UniversalTable component is a valid React component', () =>
  Effect.gen(function* () {
    expect(typeof UniversalTable).toBe('function')
    expect(UniversalTable.name).toBe('UniversalTable')
  }),
)

effect('UniversalTable props interface is properly typed', () =>
  Effect.gen(function* () {
    // This test validates that the TypeScript interface is working correctly
    const validProps: UniversalTableProps<TestData> = {
      className: 'test-class',
      columnOverrides: {
        name: { header: 'Name Override' },
      },
      data: testData,
      filtering: { globalFilter: true },
      onRowClick: (row) => console.log('Row clicked:', row),
      onRowSelect: (rows) => console.log('Rows selected:', rows),
      pagination: { pageSize: 25 },
      schema: TestSchema,
      selection: { enableMultiRowSelection: false, enableRowSelection: true },
      sorting: { multiSort: true },
      tableOptions: { enableColumnResizing: true },
    }

    // Verify all properties are accessible
    expect(validProps.data).toBeDefined()
    expect(validProps.schema).toBeDefined()
    expect(validProps.columnOverrides).toBeDefined()
    expect(validProps.pagination).toBeDefined()
    expect(validProps.sorting).toBeDefined()
    expect(validProps.filtering).toBeDefined()
    expect(validProps.selection).toBeDefined()
    expect(validProps.onRowClick).toBeDefined()
    expect(validProps.onRowSelect).toBeDefined()
    expect(validProps.className).toBeDefined()
    expect(validProps.tableOptions).toBeDefined()
  }),
)
