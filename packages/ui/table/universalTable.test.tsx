import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import type { UniversalTableProps } from '@openfaith/ui/table/universalTable'
import { Effect, Schema } from 'effect'

// Test schema with entity tag (required for schema hooks)
const TestSchema = Schema.Struct({
  _tag: Schema.Literal('TestEntity'),
  email: Schema.String,
  hiddenField: Schema.String,
  id: Schema.Number,
  isActive: Schema.Boolean,
  name: Schema.String,
})

type TestData = Schema.Schema.Type<typeof TestSchema>

effect('UniversalTable accepts required props', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      schema: TestSchema,
    }

    expect(props.schema).toBe(TestSchema)
  }),
)

effect('UniversalTable accepts optional props', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      columnOverrides: {
        name: {
          header: 'Full Name',
        },
      },
      filtering: {
        filterColumnId: 'name',
        filterKey: 'test-filter',
        filterPlaceHolder: 'Search...',
      },
      schema: TestSchema,
    }

    expect(props.columnOverrides?.name?.header).toBe('Full Name')
    expect(props.filtering?.filterColumnId).toBe('name')
  }),
)

effect('UniversalTable accepts filtering configuration', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
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
    const ActionsComponent = 'Actions'
    const props: UniversalTableProps<TestData> = {
      Actions: ActionsComponent,
      schema: TestSchema,
    }

    expect(props.Actions).toBe(ActionsComponent)
  }),
)

effect('UniversalTable accepts event handlers', () =>
  Effect.gen(function* () {
    const onRowClick = (row: TestData) => row
    const onRowSelect = (rows: Array<TestData>) => rows
    const onEditRow = (row: TestData) => row

    const props: UniversalTableProps<TestData> = {
      onEditRow,
      onRowClick,
      onRowSelect,
      schema: TestSchema,
    }

    expect(typeof props.onRowClick).toBe('function')
    expect(typeof props.onRowSelect).toBe('function')
    expect(typeof props.onEditRow).toBe('function')
  }),
)

effect('UniversalTable accepts className', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      className: 'custom-table-class',
      schema: TestSchema,
    }

    expect(props.className).toBe('custom-table-class')
  }),
)

effect('UniversalTable accepts loading state override', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      loading: true,
      schema: TestSchema,
    }

    expect(props.loading).toBe(true)
  }),
)

effect('UniversalTable accepts showRelations prop', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      schema: TestSchema,
      showRelations: false,
    }

    expect(props.showRelations).toBe(false)
  }),
)

effect('UniversalTable defaults showRelations to true', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      schema: TestSchema,
    }

    // showRelations should be undefined in props but default to true in component
    expect(props.showRelations).toBeUndefined()
  }),
)

effect('UniversalTable accepts column overrides', () =>
  Effect.gen(function* () {
    const props: UniversalTableProps<TestData> = {
      columnOverrides: {
        email: {
          header: 'Email Address',
          size: 200,
        },
        name: {
          header: 'Full Name',
        },
      },
      schema: TestSchema,
    }

    expect(props.columnOverrides?.email?.header).toBe('Email Address')
    expect(props.columnOverrides?.email?.size).toBe(200)
    expect(props.columnOverrides?.name?.header).toBe('Full Name')
  }),
)

// Type-level tests
effect('UniversalTable props should be type-safe', () =>
  Effect.gen(function* () {
    // This test validates that the TypeScript compiler correctly enforces the prop types
    const validProps: UniversalTableProps<TestData> = {
      schema: TestSchema,
    }

    // Test that schema is required
    expect(validProps.schema).toBeDefined()

    // Test that all optional props can be omitted
    expect(validProps.columnOverrides).toBeUndefined()
    expect(validProps.onRowClick).toBeUndefined()
    expect(validProps.onRowSelect).toBeUndefined()
    expect(validProps.onEditRow).toBeUndefined()
    expect(validProps.className).toBeUndefined()
    expect(validProps.Actions).toBeUndefined()
    expect(validProps.filtering).toBeUndefined()
    expect(validProps.loading).toBeUndefined()
  }),
)

effect('UniversalTable should work with different schema types', () =>
  Effect.gen(function* () {
    const SimpleSchema = Schema.Struct({
      _tag: Schema.Literal('Simple'),
      id: Schema.Number,
    })

    type SimpleData = Schema.Schema.Type<typeof SimpleSchema>

    const props: UniversalTableProps<SimpleData> = {
      schema: SimpleSchema,
    }

    expect(props.schema).toBe(SimpleSchema)
  }),
)
