# UniversalGlideTable

A simplified table component built on [Glide Data Grid](https://docs.grid.glideapps.com/) that automatically generates columns from Effect Schema definitions.

## Features

- **Schema-driven**: Automatically generates columns from Effect Schema
- **Type-safe**: Full TypeScript support with Effect Schema
- **Performance**: Built on Glide Data Grid for handling large datasets
- **Auto-detection**: Automatically detects cell types from schema
- **Configurable**: Supports custom column widths, headers, and cell types via schema annotations
- **Resizable columns**: Users can resize columns by dragging the column borders
- **Row markers**: Shows row numbers with checkbox selection capability
- **Multi-select**: Select multiple rows using checkboxes or keyboard shortcuts
- **Header icons**: Visual indicators for column data types (text, number, date, email, etc.)

## Basic Usage

```tsx
import { UniversalGlideTable } from '@openfaith/ui'
import { Schema } from 'effect'
import { OfUiConfig } from '@openfaith/schema/shared/schema'

// Define your schema with table annotations
const PersonSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String.annotations({
    [OfUiConfig]: {
      table: {
        header: 'Name',
        width: 200,
        order: 1,
      },
    },
  }),
  email: Schema.String.annotations({
    [OfUiConfig]: {
      table: {
        header: 'Email',
        cellType: 'email',
        width: 250,
        order: 2,
      },
    },
  }),
  isActive: Schema.Boolean.annotations({
    [OfUiConfig]: {
      table: {
        header: 'Active',
        cellType: 'boolean',
        width: 100,
        order: 3,
      },
    },
  }),
})

// Use the table component
<UniversalGlideTable
  schema={PersonSchema}
  height={600}
  showRowNumbers={true}
  onRowClick={(row) => console.log('Row clicked:', row)}
  onEditRow={(row) => console.log('Edit row:', row)}
  onRowsSelected={(rows) => console.log('Selected rows:', rows)}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `schema` | `Schema.Schema<T>` | Effect Schema that defines the data structure |
| `onRowClick` | `(row: T) => void` | Optional callback when a row is clicked |
| `onEditRow` | `(row: T) => void` | Optional callback for editing a row |
| `onRowsSelected` | `(rows: T[]) => void` | Optional callback when rows are selected |
| `className` | `string` | Optional CSS class name |
| `height` | `number` | Height of the grid (default: 600) |
| `smoothScrollX` | `boolean` | Enable smooth horizontal scrolling (default: true) |
| `smoothScrollY` | `boolean` | Enable smooth vertical scrolling (default: true) |
| `showRowNumbers` | `boolean` | Show row numbers with selection checkboxes (default: true) |

## Supported Cell Types

The table automatically detects and renders different cell types based on schema annotations:

- **text**: Default text cells
- **number**: Numeric values
- **boolean**: Checkbox/boolean values
- **email**: Email addresses (rendered as links)
- **link**: URLs (rendered as links)
- **avatar**: Images (rendered as avatars)
- **date/datetime**: Date values
- **currency**: Currency values

## Schema Annotations

Use the `OfUiConfig` annotation to configure table columns:

```tsx
Schema.String.annotations({
  [OfUiConfig]: {
    table: {
      header: 'Column Header',    // Display name for the column
      cellType: 'email',          // Cell type (auto-detected if not specified)
      width: 200,                 // Column width in pixels
      order: 1,                   // Column order (lower numbers appear first)
      hidden: false,              // Hide column from table
      sortable: true,             // Enable sorting
      filterable: true,           // Enable filtering
    },
  },
})
```

## Differences from UniversalTable

This is a simplified version of the existing `UniversalTable` component with the following differences:

1. **Built on Glide Data Grid** instead of TanStack Table
2. **Simplified feature set** - focuses on core table functionality
3. **Better performance** for large datasets
4. **No relation columns** (yet) - just displays direct schema fields
5. **No collection toolbar** - pure table display

## Future Enhancements

- Add support for relation columns
- Implement inline editing
- Add filtering and sorting UI
- Support for custom cell renderers
- Integration with collection toolbar components