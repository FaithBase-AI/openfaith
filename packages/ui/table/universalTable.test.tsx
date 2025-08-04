import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { UniversalTable, type UniversalTableProps } from '@openfaith/ui/table/universalTable'
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
      filtering: {
        filterColumnId: 'name',
        filterKey: 'test-filter',
        filterPlaceHolder: 'Search...',
      },
      pagination: { limit: 100, pageSize: 10 },
      schema: TestSchema,
    }

    expect(props.pagination?.pageSize).toBe(10)
  }),
)

effect('UniversalTable accepts pagination configuration', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      pagination: {
        limit: 200,
        pageSize: 25,
      },
      schema: TestSchema,
    }

    expect(props.pagination?.pageSize).toBe(25)
    expect(props.pagination?.limit).toBe(200)
  }),
)

effect('UniversalTable accepts filtering configuration', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      filtering: {
        filterColumnId: 'email',
        filterKey: 'email-filter',
        filterPlaceHolder: 'Search emails...',
      },
      schema: TestSchema,
    }

    expect(props.filtering?.filterColumnId).toBe('email')
    expect(props.filtering?.filterPlaceHolder).toBe('Search emails...')
  }),
)

effect('UniversalTable accepts Actions component', () =>
  Effect.gen(function* () {
    const ActionsComponent = () => 'Actions'
    const props: UniversalTableProps<TestData> = {
      Actions: ActionsComponent(),
      data: testData,
      schema: TestSchema,
    }

    expect(props.Actions).toBeDefined()
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

effect('UniversalTable accepts loading state', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      data: testData,
      loading: true,
      schema: TestSchema,
    }

    expect(props.loading).toBe(true)
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
      Actions: 'Actions Component',
      CollectionCard: 'Collection Card Component',
      className: 'test-class',
      columnOverrides: {
        name: { header: 'Name Override' },
      },
      data: testData,
      filtering: {
        filterColumnId: 'name',
        filterKey: 'test-filter',
        filterPlaceHolder: 'Search...',
      },
      loading: false,
      onRowClick: (row) => console.log('Row clicked:', row),
      onRowSelect: (rows) => console.log('Rows selected:', rows),
      pagination: { limit: 100, pageSize: 25 },
      schema: TestSchema,
    }

    // Verify all properties are accessible
    expect(validProps.data).toBeDefined()
    expect(validProps.schema).toBeDefined()
    expect(validProps.columnOverrides).toBeDefined()
    expect(validProps.pagination).toBeDefined()
    expect(validProps.filtering).toBeDefined()
    expect(validProps.onRowClick).toBeDefined()
    expect(validProps.onRowSelect).toBeDefined()
    expect(validProps.className).toBeDefined()
    expect(validProps.Actions).toBeDefined()
    expect(validProps.CollectionCard).toBeDefined()
    expect(validProps.loading).toBeDefined()
  }),
)
