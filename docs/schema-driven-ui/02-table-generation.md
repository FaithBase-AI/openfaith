# Table Generation Initiative

## Overview

This initiative focuses on creating automatic table generation from Effect Schema definitions, leveraging TanStack Table for powerful data display capabilities. The goal is to reduce table development time by 80% while providing rich features like sorting, filtering, and custom cell rendering.

## Technical Approach

### 1. Extended Schema Annotation System

#### Table Configuration in OfUiConfig

The table configuration extends the existing `FieldConfig` interface in `packages/schema/shared/schema.ts`:

```typescript
// packages/schema/shared/schema.ts (already implemented)
export interface FieldConfig {
  field?: {
    // ... existing field config
  };
  table?: {
    header?: string;
    width?: number;
    sortable?: boolean; // AUTO-DETECTED (default: true)
    filterable?: boolean; // AUTO-DETECTED (default: true)
    cellType?:
      | "text"
      | "email"
      | "number"
      | "boolean"
      | "date"
      | "datetime"
      | "currency"
      | "badge"
      | "avatar"
      | "link";
    hidden?: boolean;
    pinned?: "left" | "right";
  };
}
```

### 2. Enhanced Schema Definitions with Table Annotations

#### Example: Person Schema with Table Configuration

```typescript
import { OfUiConfig } from "@openfaith/schema/shared/schema";
import { Schema } from "effect";

export const PersonWithTableSchema = Schema.Struct({
  firstName: Schema.String.annotations({
    description: "The first name of the person",
    [OfUiConfig]: {
      field: {
        // type: "text" - AUTO-DETECTED from Schema.String
        label: "First Name",
        placeholder: "Enter first name",
      },
      table: {
        header: "First Name",
        width: 150,
        // sortable: true - AUTO-DETECTED (default)
        // filterable: true - AUTO-DETECTED (default)
        // cellType: "text" - AUTO-DETECTED from Schema.String
      },
    },
  }),

  lastName: Schema.String.annotations({
    description: "The last name of the person",
    [OfUiConfig]: {
      field: {
        label: "Last Name",
        placeholder: "Enter last name",
      },
      table: {
        header: "Last Name",
        width: 150,
      },
    },
  }),

  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => "Invalid email address",
    }),
  ).annotations({
    [OfUiConfig]: {
      field: {
        // type: "email" - AUTO-DETECTED from email pattern
        label: "Email Address",
        placeholder: "Enter email address",
      },
      table: {
        header: "Email",
        width: 200,
        // cellType: "email" - AUTO-DETECTED from email pattern
        // sortable: true - AUTO-DETECTED (default)
        // filterable: true - AUTO-DETECTED (default)
      },
    },
  }),

  age: Schema.Number.annotations({
    [OfUiConfig]: {
      field: {
        label: "Age",
        min: 0,
        max: 120,
      },
      table: {
        header: "Age",
        width: 80,
        // cellType: "number" - AUTO-DETECTED from Schema.Number
      },
    },
  }),

  salary: Schema.Number.pipe(Schema.NullOr).annotations({
    [OfUiConfig]: {
      field: {
        // type: "number" - AUTO-DETECTED from Schema.Number
        label: "Annual Salary",
        placeholder: "Enter salary",
        min: 0,
        step: 1000,
        // required: false - AUTO-DETECTED from Schema.NullOr
      },
      table: {
        header: "Salary",
        width: 120,
        cellType: "currency", // Override auto-detection (would be "number")
        // sortable: true - AUTO-DETECTED (default)
        filterable: false, // Override auto-detection (would be true)
      },
    },
  }),

  isActive: Schema.Boolean.annotations({
    [OfUiConfig]: {
      field: {
        // type: "switch" - AUTO-DETECTED from Schema.Boolean
        label: "Active",
      },
      table: {
        header: "Status",
        width: 100,
        // cellType: "boolean" - AUTO-DETECTED from Schema.Boolean
        // sortable: true - AUTO-DETECTED (default)
        // filterable: true - AUTO-DETECTED (default)
      },
    },
  }),

  department: Schema.Literal(
    "Engineering",
    "Sales",
    "Marketing",
    "HR",
  ).annotations({
    [OfUiConfig]: {
      field: {
        // type: "select" - AUTO-DETECTED from Schema.Literal union
        // options: [...] - AUTO-DETECTED from literal values
        label: "Department",
        options: [
          { label: "Engineering", value: "Engineering" },
          { label: "Sales", value: "Sales" },
          { label: "Marketing", value: "Marketing" },
          { label: "Human Resources", value: "HR" },
        ],
      },
      table: {
        header: "Department",
        width: 120,
        cellType: "badge", // Override auto-detection (would be "text")
      },
    },
  }),

  avatar: Schema.String.pipe(Schema.NullOr).annotations({
    [OfUiConfig]: {
      field: {
        // type: "text" - AUTO-DETECTED from Schema.String
        label: "Avatar URL",
        placeholder: "Enter avatar URL",
        // required: false - AUTO-DETECTED from Schema.NullOr
      },
      table: {
        header: "Avatar",
        width: 80,
        cellType: "avatar", // Override auto-detection (would be "text")
        sortable: false, // Override auto-detection (would be true)
        filterable: false, // Override auto-detection (would be true)
      },
    },
  }),

  bio: Schema.String.pipe(Schema.NullOr).annotations({
    [OfUiConfig]: {
      field: {
        type: "textarea", // Override auto-detection (would be "text")
        label: "Biography",
        placeholder: "Tell us about yourself...",
        rows: 4,
        // required: false - AUTO-DETECTED from Schema.NullOr
      },
      table: {
        hidden: true, // This field won't appear in tables
      },
    },
  }),
});

export type PersonWithTable = typeof PersonWithTableSchema.Type;
```

### 3. Table Generation Engine

#### Column Configuration Generator

```typescript
// packages/ui/src/table/columnGenerator.ts
import { Schema, SchemaAST } from "effect";
import { OfUiConfig, type FieldConfig } from "@openfaith/schema/shared/schema";
import type { ColumnDef } from "@tanstack/react-table";

export const generateColumns = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<ColumnDef<T>>>> = {},
): ColumnDef<T>[] => {
  const fields = extractSchemaFields(schema);
  const columns: ColumnDef<T>[] = [];

  for (const field of fields) {
    const key = field.key as keyof T;

    // Get UI config from annotation
    const uiConfig = SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(
      field.schema,
    );
    const tableConfig = uiConfig?.table;

    // Skip hidden fields
    if (tableConfig?.hidden) continue;

    // Fallback to auto-detection if no config provided
    const autoConfig = tableConfig || autoDetectTableConfig(field.schema);

    // Build column definition
    const column: ColumnDef<T> = {
      accessorKey: key as string,
      header: autoConfig.header || formatLabel(String(key)),
      size: autoConfig.width || 150,
      enableSorting: autoConfig.sortable ?? true,
      enableColumnFilter: autoConfig.filterable ?? true,
      cell: getCellRenderer(autoConfig.cellType, autoConfig.cellConfig),
      ...overrides[key],
    };

    columns.push(column);
  }

  return columns;
};

// Auto-detect table config from schema when no annotation is provided
const autoDetectTableConfig = (
  schema: Schema.Schema.AnyNoContext,
  fieldName: string,
): Partial<FieldConfig["table"]> => {
  const ast = schema.ast;

  // Default table settings
  const defaults = {
    sortable: true,
    filterable: true,
    width: 150,
  };

  switch (ast._tag) {
    case "StringKeyword":
      // Check for email patterns in refinements
      if (hasEmailPattern(schema)) {
        return { ...defaults, cellType: "email", width: 200 };
      }
      // Check field name patterns
      if (fieldName.toLowerCase().includes("avatar")) {
        return {
          ...defaults,
          cellType: "avatar",
          width: 80,
          sortable: false,
          filterable: false,
        };
      }
      return { ...defaults, cellType: "text" };

    case "NumberKeyword":
      // Check field name for currency indicators
      if (
        fieldName.toLowerCase().includes("salary") ||
        fieldName.toLowerCase().includes("price") ||
        fieldName.toLowerCase().includes("cost")
      ) {
        return { ...defaults, cellType: "currency", width: 120 };
      }
      return { ...defaults, cellType: "number", width: 100 };

    case "BooleanKeyword":
      return { ...defaults, cellType: "boolean", width: 100 };

    case "Union":
      if (ast.types.every((t) => t._tag === "Literal")) {
        return { ...defaults, cellType: "badge", width: 120 };
      }
      break;

    default:
      return { ...defaults, cellType: "text" };
  }

  return { ...defaults, cellType: "text" };
};

// Helper to detect email patterns in schema refinements
const hasEmailPattern = (schema: Schema.Schema.AnyNoContext): boolean => {
  // Check if schema has email validation pattern
  // Implementation would inspect schema refinements/filters
  return false; // Placeholder
};
```

#### Cell Renderer System

```typescript
// packages/ui/src/table/cellRenderers.tsx
import React from 'react'
import { Badge } from '@openfaith/ui/components/badge'
import { Avatar } from '@openfaith/ui/components/avatar'

export const getCellRenderer = (cellType?: string) => {
  if (!cellType) return undefined

  return ({ getValue, row }: any) => {
    const value = getValue()

    switch (cellType) {
      case 'text':
        return renderTextCell(value)

      case 'email':
        return renderEmailCell(value)

      case 'number':
        return renderNumberCell(value)

      case 'currency':
        return renderCurrencyCell(value)

      case 'boolean':
        return renderBooleanCell(value)

      case 'date':
        return renderDateCell(value)

      case 'datetime':
        return renderDateTimeCell(value)

      case 'badge':
        return renderBadgeCell(value)

      case 'link':
        return renderLinkCell(value)

      case 'avatar':
        return renderAvatarCell(value, row.original)

      default:
        return String(value || '')
    }
  }
}

const renderTextCell = (value: any) => {
  return String(value || '')
}

const renderEmailCell = (value: string) => {
  if (!value) return ''
  return (
    <a
      href={`mailto:${value}`}
      className="text-blue-600 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {value}
    </a>
  )
}

const renderNumberCell = (value: number) => {
  if (value == null) return ''
  return value.toLocaleString()
}

const renderCurrencyCell = (value: number) => {
  if (value == null) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const renderBooleanCell = (value: boolean) => {
  return (
    <Badge variant={value ? 'default' : 'secondary'}>
      {value ? 'Yes' : 'No'}
    </Badge>
  )
}

const renderDateCell = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString()
}

const renderDateTimeCell = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleString()
}

const renderBadgeCell = (value: string) => {
  if (!value) return ''
  return <Badge>{value}</Badge>
}

const renderLinkCell = (value: string) => {
  if (!value) return ''
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {value}
    </a>
  )
}

const renderAvatarCell = (value: string, row: any) => {
  const name = row.firstName && row.lastName
    ? `${row.firstName} ${row.lastName}`
    : row.name || 'Unknown'

  return (
    <Avatar
      src={value}
      alt={name}
      fallback={name.split(' ').map(n => n[0]).join('').toUpperCase()}
    />
  )
}


```

### 4. Universal Table Component

#### Core Implementation

```typescript
// packages/ui/src/table/UniversalTable.tsx
import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type TableOptions
} from '@tanstack/react-table'
import { Schema } from 'effect'
import { generateColumns } from './columnGenerator'
import { TableComponent } from './TableComponent'

export interface UniversalTableProps<T> {
  schema: Schema.Schema<T>
  data: T[]
  columnOverrides?: Partial<Record<keyof T, Partial<ColumnDef<T>>>>
  tableOptions?: Partial<TableOptions<T>>
  onRowClick?: (row: T) => void
  onRowSelect?: (rows: T[]) => void
  className?: string
  pagination?: {
    pageSize?: number
    showPagination?: boolean
  }
  sorting?: {
    sortBy?: keyof T
    sortOrder?: 'asc' | 'desc'
    multiSort?: boolean
  }
  filtering?: {
    globalFilter?: boolean
    columnFilters?: boolean
  }
  selection?: {
    enableRowSelection?: boolean
    enableMultiRowSelection?: boolean
  }
}

export const UniversalTable = <T,>({
  schema,
  data,
  columnOverrides = {},
  tableOptions = {},
  onRowClick,
  onRowSelect,
  className,
  pagination = { pageSize: 20, showPagination: true },
  sorting = { multiSort: true },
  filtering = { globalFilter: true, columnFilters: true },
  selection = { enableRowSelection: false, enableMultiRowSelection: false },
}: UniversalTableProps<T>) => {
  const columns = React.useMemo(() => {
    const baseColumns = generateColumns(schema, columnOverrides)

    // Add selection column if enabled
    if (selection.enableRowSelection) {
      const selectionColumn: ColumnDef<T> = {
        id: 'select',
        header: ({ table }) => (
          selection.enableMultiRowSelection ? (
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="rounded border-gray-300"
            />
          ) : null
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      }
      return [selectionColumn, ...baseColumns]
    }

    return baseColumns
  }, [schema, columnOverrides, selection])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: selection.enableRowSelection,
    enableMultiRowSelection: selection.enableMultiRowSelection,
    initialState: {
      pagination: {
        pageSize: pagination.pageSize || 20,
      },
      sorting: sorting.sortBy ? [{
        id: String(sorting.sortBy),
        desc: sorting.sortOrder === 'desc'
      }] : [],
    },
    ...tableOptions
  })

  // Handle row selection changes
  React.useEffect(() => {
    if (onRowSelect && selection.enableRowSelection) {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
      onRowSelect(selectedRows)
    }
  }, [table.getSelectedRowModel().rows, onRowSelect, selection.enableRowSelection])

  return (
    <TableComponent
      table={table}
      onRowClick={onRowClick}
      className={className}
      showPagination={pagination.showPagination}
      showGlobalFilter={filtering.globalFilter}
      showColumnFilters={filtering.columnFilters}
    />
  )
}
```

#### Table Component Implementation

```typescript
// packages/ui/src/table/TableComponent.tsx
import React from 'react'
import { flexRender, type Table } from '@tanstack/react-table'
import { Input } from '@openfaith/ui/components/input'
import { Button } from '@openfaith/ui/components/button'

interface TableComponentProps<T> {
  table: Table<T>
  onRowClick?: (row: T) => void
  className?: string
  showPagination?: boolean
  showGlobalFilter?: boolean
  showColumnFilters?: boolean
}

export const TableComponent = <T,>({
  table,
  onRowClick,
  className,
  showPagination = true,
  showGlobalFilter = true,
  showColumnFilters = true,
}: TableComponentProps<T>) => {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Global Filter */}
      {showGlobalFilter && (
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search all columns..."
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900"
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span className="ml-1">
                            {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>

                      {/* Column Filter */}
                      {showColumnFilters && header.column.getCanFilter() && (
                        <Input
                          placeholder="Filter..."
                          value={header.column.getFilterValue() as string ?? ''}
                          onChange={(e) => header.column.setFilterValue(e.target.value)}
                          className="w-20 h-6 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Implementation Plan

### Week 1: Foundation

- [ ] **Day 1-2**: Extend UI annotation types for table configuration

  - Add table-specific fields to `FieldConfig` interface
  - Create table configuration utilities
  - Set up cell type definitions

- [ ] **Day 3-4**: Build column generation engine

  - Implement `generateColumns` function
  - Create auto-detection for table configs
  - Add column override support

- [ ] **Day 5**: Create basic cell renderer system
  - Implement core cell renderers (text, email, currency, boolean)
  - Add cell configuration support
  - Test with various data types

### Week 2: Advanced Features

- [ ] **Day 1-2**: Implement UniversalTable component

  - Create main table component structure
  - Integrate with TanStack Table
  - Add basic sorting and filtering

- [ ] **Day 3-4**: Add advanced cell renderers

  - Implement tags, badge, avatar, progress renderers
  - Add link and date formatting options
  - Create custom cell renderer support

- [ ] **Day 5**: Add table features
  - Implement pagination controls
  - Add row selection capabilities
  - Create global and column filtering

## File Structure

```
packages/
├── schema/
│   └── shared/
│       └── schema.ts                   # FieldConfig interface and OfUiConfig symbol
├── ui/
│   └── src/
│       └── table/
│           ├── UniversalTable.tsx      # Main table component
│           ├── TableComponent.tsx      # Table rendering component
│           ├── columnGenerator.ts      # Column generation utilities
│           ├── cellRenderers.tsx       # Cell renderer implementations
│           └── tableUtils.ts           # Table utility functions
└── shared/
    └── src/
        └── ui/
            └── formatters.ts           # Date/number formatting utilities
```

## Usage Examples

### 1. Fully Automatic Table

```typescript
const PersonTable = () => (
  <UniversalTable
    schema={PersonWithTableSchema}
    data={people}
    onRowClick={(person) => navigate(`/people/${person.id}`)}
  />
)
```

### 2. Table with Custom Configuration

```typescript
const CustomPersonTable = () => (
  <UniversalTable
    schema={PersonWithTableSchema}
    data={people}
    columnOverrides={{
      salary: {
        cell: ({ getValue }) => `$${getValue()?.toLocaleString() || 'N/A'}`
      },
      actions: {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => handleEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
      }
    }}
    pagination={{ pageSize: 50 }}
    selection={{ enableRowSelection: true, enableMultiRowSelection: true }}
    onRowSelect={(selectedPeople) => setSelectedPeople(selectedPeople)}
  />
)
```

### 3. Table with Advanced Features

```typescript
const AdvancedPersonTable = () => (
  <UniversalTable
    schema={PersonWithTableSchema}
    data={people}
    sorting={{
      sortBy: 'lastName',
      sortOrder: 'asc',
      multiSort: true
    }}
    filtering={{
      globalFilter: true,
      columnFilters: true
    }}
    pagination={{
      pageSize: 25,
      showPagination: true
    }}
    selection={{
      enableRowSelection: true,
      enableMultiRowSelection: true
    }}
    onRowClick={(person) => setSelectedPerson(person)}
    onRowSelect={(people) => setBulkSelectedPeople(people)}
    className="shadow-lg rounded-lg"
  />
)
```

## Research References

### TanStack Table Documentation

- **Context7 Search**: "tanstack table column definitions and types"

  - Study `ColumnDef` interface and configuration options
  - Learn about cell rendering patterns
  - Understand sorting and filtering implementations

- **Context7 Search**: "tanstack table react table integration"
  - Study `useReactTable` hook usage patterns
  - Learn about table state management
  - Understand row selection and pagination

### Cell Rendering Patterns

- **Context7 Search**: "react table cell custom renderers"
  - Study custom cell component patterns
  - Learn about cell context and data access
  - Understand performance optimization for cell rendering

### Effect Schema Integration

- **Effect-MCP Search**: "Schema AST property signatures extraction"
  - Learn about extracting field information from schemas
  - Understand property signature handling
  - Study type-safe field access patterns

## Success Metrics

### Developer Experience

- **Code Reduction**: 80% less boilerplate for standard tables
- **Feature Rich**: Built-in sorting, filtering, pagination, selection
- **Type Safety**: 100% type safety from schema to table rendering

### Performance Metrics

- **Render Performance**: <16ms render time for 1000 rows
- **Memory Usage**: <2MB additional memory for large datasets
- **Bundle Size**: <30KB additional bundle size

### Feature Coverage

- **Cell Types**: 10+ built-in cell renderer types
- **Customization**: 100% override capability for any column
- **Accessibility**: WCAG 2.1 AA compliance for generated tables

## Risk Mitigation

### Performance Risks

- **Large Datasets**: Mitigated by virtualization and pagination
- **Complex Cell Renderers**: Addressed through memoization
- **Re-render Performance**: Optimized through React.memo and useMemo

### Complexity Risks

- **Over-abstraction**: Balanced by direct TanStack Table access
- **Customization Limits**: Addressed through comprehensive override system
- **Learning Curve**: Minimized by familiar TanStack Table patterns

## Next Steps

1. **Schema Enhancement**: Extend existing Person schema with table annotations
2. **Prototype Development**: Build proof-of-concept table with basic cell renderers
3. **Integration Testing**: Test with existing data and UI components
4. **Performance Testing**: Validate performance with large datasets
5. **Documentation**: Create comprehensive usage guides and examples
