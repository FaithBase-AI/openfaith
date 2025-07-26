# Collection Components Initiative

## Overview

This initiative focuses on creating unified collection components that combine form and table generation into complete CRUD interfaces. These components will provide a full data management experience with minimal configuration, leveraging both the form and table generation systems.

## Technical Approach

### 1. Collection Configuration System

#### Collection Configuration Interface

```typescript
// packages/ui/src/collection/types.ts
export interface CollectionConfig<T> {
  // Core configuration
  schema: Schema.Schema<T>;
  title?: string;
  description?: string;

  // Data management
  data: T[];
  loading?: boolean;
  error?: string | null;

  // CRUD operations
  operations: {
    create?: {
      enabled: boolean;
      onSubmit: (data: T) => Promise<void> | void;
      defaultValues?: Partial<T>;
      // Field types are AUTO-DETECTED from schema - only override when needed
      formOverrides?: Partial<Record<keyof T, Partial<FieldConfig["field"]>>>;
      title?: string;
      submitText?: string;
    };
    read?: {
      enabled: boolean;
      onRowClick?: (item: T) => void;
      tableOverrides?: Partial<Record<keyof T, Partial<ColumnDef<T>>>>;
    };
    update?: {
      enabled: boolean;
      onSubmit: (data: T) => Promise<void> | void;
      // Field types are AUTO-DETECTED from schema - only override when needed
      formOverrides?: Partial<Record<keyof T, Partial<FieldConfig["field"]>>>;
      title?: string;
      submitText?: string;
    };
    delete?: {
      enabled: boolean;
      onDelete: (item: T) => Promise<void> | void;
      onBulkDelete?: (items: T[]) => Promise<void> | void;
      confirmationTitle?: string;
      confirmationMessage?: string;
    };
  };

  // Bulk operations
  bulk?: {
    enabled: boolean;
    operations: Array<{
      id: string;
      label: string;
      icon?: React.ReactNode;
      action: (items: T[]) => Promise<void> | void;
      variant?: "default" | "destructive" | "outline";
    }>;
  };

  // Export functionality
  export?: {
    enabled: boolean;
    formats: Array<"csv" | "xlsx" | "json" | "pdf">;
    filename?: string;
    customExporters?: Record<string, (data: T[]) => void>;
  };

  // Search and filtering
  search?: {
    enabled: boolean;
    placeholder?: string;
    searchFields?: Array<keyof T>;
  };

  // Layout configuration
  layout?: {
    formPosition?: "top" | "side" | "modal";
    tablePosition?: "bottom" | "main";
    spacing?: "compact" | "normal" | "relaxed";
  };
}
```

### 2. Universal Collection Component

#### Core Implementation

```typescript
// packages/ui/src/collection/UniversalCollection.tsx
import React, { useState } from 'react'
import { Schema } from 'effect'
import { UniversalForm } from '../form/UniversalForm'
import { UniversalTable } from '../table/UniversalTable'
import { CollectionHeader } from './CollectionHeader'
import { CollectionActions } from './CollectionActions'
import { ConfirmationDialog } from './ConfirmationDialog'
import { ExportDialog } from './ExportDialog'
import type { CollectionConfig } from './types'

export const UniversalCollection = <T extends { id: string }>({
  schema,
  title,
  description,
  data,
  loading = false,
  error = null,
  operations,
  bulk,
  export: exportConfig,
  search,
  layout = { formPosition: 'top', tablePosition: 'bottom', spacing: 'normal' },
}: CollectionConfig<T>) => {
  // State management
  const [selectedItems, setSelectedItems] = useState<T[]>([])
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<T | null>(null)
  const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!search?.enabled || !searchQuery) return data

    const searchFields = search.searchFields || Object.keys(schema.fields) as Array<keyof T>
    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return String(value || '').toLowerCase().includes(searchQuery.toLowerCase())
      })
    )
  }, [data, searchQuery, search, schema])

  // Handle CRUD operations
  const handleCreate = async (newItem: T) => {
    if (operations.create?.onSubmit) {
      await operations.create.onSubmit(newItem)
      setShowCreateForm(false)
    }
  }

  const handleUpdate = async (updatedItem: T) => {
    if (operations.update?.onSubmit) {
      await operations.update.onSubmit(updatedItem)
      setEditingItem(null)
    }
  }

  const handleDelete = async (item: T) => {
    if (operations.delete?.onDelete) {
      await operations.delete.onDelete(item)
      setShowDeleteConfirmation(null)
    }
  }

  const handleBulkDelete = async () => {
    if (operations.delete?.onBulkDelete && selectedItems.length > 0) {
      await operations.delete.onBulkDelete(selectedItems)
      setSelectedItems([])
      setShowBulkDeleteConfirmation(false)
    }
  }

  const handleBulkAction = async (actionId: string) => {
    const action = bulk?.operations.find(op => op.id === actionId)
    if (action && selectedItems.length > 0) {
      await action.action(selectedItems)
      setSelectedItems([])
    }
  }

  const handleExport = (format: string) => {
    if (exportConfig?.customExporters?.[format]) {
      exportConfig.customExporters[format](filteredData)
    } else {
      // Default export logic
      exportData(filteredData, format, exportConfig?.filename)
    }
    setShowExportDialog(false)
  }

  // Render layout based on configuration
  const renderContent = () => {
    switch (layout.formPosition) {
      case 'side':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {renderCreateForm()}
            </div>
            <div className="lg:col-span-2">
              {renderTable()}
            </div>
          </div>
        )

      case 'modal':
        return (
          <div className="space-y-6">
            {renderTable()}
            {renderModals()}
          </div>
        )

      default: // 'top'
        return (
          <div className="space-y-6">
            {renderCreateForm()}
            {renderTable()}
          </div>
        )
    }
  }

  const renderCreateForm = () => {
    if (!operations.create?.enabled) return null

    if (layout.formPosition === 'modal') {
      return showCreateForm ? (
        <Modal
          title={operations.create.title || `Create ${title}`}
          onClose={() => setShowCreateForm(false)}
        >
          <UniversalForm
            schema={schema}
            defaultValues={operations.create.defaultValues}
            onSubmit={handleCreate}
            fieldOverrides={operations.create.formOverrides}
            submitText={operations.create.submitText || 'Create'}
          />
        </Modal>
      ) : null
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {operations.create.title || `Create ${title}`}
        </h3>
        <UniversalForm
          schema={schema}
          defaultValues={operations.create.defaultValues}
          onSubmit={handleCreate}
          fieldOverrides={operations.create.formOverrides}
          submitText={operations.create.submitText || 'Create'}
        />
      </div>
    )
  }

  const renderTable = () => {
    if (!operations.read?.enabled) return null

    return (
      <div className="bg-white rounded-lg shadow">
        <CollectionHeader
          title={title}
          description={description}
          itemCount={filteredData.length}
          selectedCount={selectedItems.length}
          search={search}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={layout.formPosition === 'modal' ? () => setShowCreateForm(true) : undefined}
          createEnabled={operations.create?.enabled}
        />

        <CollectionActions
          selectedItems={selectedItems}
          bulkOperations={bulk?.operations || []}
          exportConfig={exportConfig}
          onBulkAction={handleBulkAction}
          onBulkDelete={() => setShowBulkDeleteConfirmation(true)}
          onExport={() => setShowExportDialog(true)}
          deleteEnabled={operations.delete?.enabled}
        />

        <UniversalTable
          schema={schema}
          data={filteredData}
          columnOverrides={operations.read.tableOverrides}
          onRowClick={operations.read.onRowClick || (operations.update?.enabled ? setEditingItem : undefined)}
          onRowSelect={setSelectedItems}
          selection={{
            enableRowSelection: bulk?.enabled || operations.delete?.onBulkDelete !== undefined,
            enableMultiRowSelection: true
          }}
          loading={loading}
          error={error}
        />
      </div>
    )
  }

  const renderModals = () => (
    <>
      {/* Edit Modal */}
      {editingItem && operations.update?.enabled && (
        <Modal
          title={operations.update.title || `Edit ${title}`}
          onClose={() => setEditingItem(null)}
        >
          <UniversalForm
            schema={schema}
            defaultValues={editingItem}
            onSubmit={handleUpdate}
            fieldOverrides={operations.update.formOverrides}
            submitText={operations.update.submitText || 'Update'}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirmation && (
        <ConfirmationDialog
          title={operations.delete?.confirmationTitle || 'Delete Item'}
          message={operations.delete?.confirmationMessage || 'Are you sure you want to delete this item?'}
          onConfirm={() => handleDelete(showDeleteConfirmation)}
          onCancel={() => setShowDeleteConfirmation(null)}
          variant="destructive"
        />
      )}

      {/* Bulk Delete Confirmation */}
      {showBulkDeleteConfirmation && (
        <ConfirmationDialog
          title="Delete Selected Items"
          message={`Are you sure you want to delete ${selectedItems.length} selected items?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDeleteConfirmation(false)}
          variant="destructive"
        />
      )}

      {/* Export Dialog */}
      {showExportDialog && exportConfig && (
        <ExportDialog
          formats={exportConfig.formats}
          filename={exportConfig.filename}
          onExport={handleExport}
          onCancel={() => setShowExportDialog(false)}
        />
      )}
    </>
  )

  return (
    <div className={`space-y-6 ${getSpacingClass(layout.spacing)}`}>
      {renderContent()}
    </div>
  )
}

const getSpacingClass = (spacing?: 'compact' | 'normal' | 'relaxed') => {
  switch (spacing) {
    case 'compact': return 'space-y-3'
    case 'relaxed': return 'space-y-8'
    default: return 'space-y-6'
  }
}
```

### 3. Collection Header Component

```typescript
// packages/ui/src/collection/CollectionHeader.tsx
import React from 'react'
import { Button } from '@openfaith/ui/components/button'
import { Input } from '@openfaith/ui/components/input'
import { PlusIcon, SearchIcon } from '@openfaith/ui/icons'

interface CollectionHeaderProps {
  title?: string
  description?: string
  itemCount: number
  selectedCount: number
  search?: {
    enabled: boolean
    placeholder?: string
  }
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreateClick?: () => void
  createEnabled?: boolean
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  title,
  description,
  itemCount,
  selectedCount,
  search,
  searchQuery,
  onSearchChange,
  onCreateClick,
  createEnabled
}) => {
  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>

        {createEnabled && onCreateClick && (
          <Button onClick={onCreateClick} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create New
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedCount > 0 ? (
            <span>{selectedCount} of {itemCount} selected</span>
          ) : (
            <span>{itemCount} items</span>
          )}
        </div>

        {search?.enabled && (
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={search.placeholder || 'Search...'}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

### 4. Collection Actions Component

```typescript
// packages/ui/src/collection/CollectionActions.tsx
import React from 'react'
import { Button } from '@openfaith/ui/components/button'
import { DropdownMenu } from '@openfaith/ui/components/dropdown-menu'
import { TrashIcon, DownloadIcon, MoreHorizontalIcon } from '@openfaith/ui/icons'

interface CollectionActionsProps<T> {
  selectedItems: T[]
  bulkOperations: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    action: (items: T[]) => Promise<void> | void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  exportConfig?: {
    enabled: boolean
    formats: Array<'csv' | 'xlsx' | 'json' | 'pdf'>
  }
  onBulkAction: (actionId: string) => void
  onBulkDelete: () => void
  onExport: () => void
  deleteEnabled?: boolean
}

export const CollectionActions = <T,>({
  selectedItems,
  bulkOperations,
  exportConfig,
  onBulkAction,
  onBulkDelete,
  onExport,
  deleteEnabled
}: CollectionActionsProps<T>) => {
  const hasSelectedItems = selectedItems.length > 0
  const showActions = hasSelectedItems || exportConfig?.enabled

  if (!showActions) return null

  return (
    <div className="px-6 py-3 border-b bg-gray-50">
      <div className="flex items-center gap-2">
        {hasSelectedItems && (
          <>
            {/* Bulk Delete */}
            {deleteEnabled && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                className="flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Delete ({selectedItems.length})
              </Button>
            )}

            {/* Custom Bulk Operations */}
            {bulkOperations.map((operation) => (
              <Button
                key={operation.id}
                variant={operation.variant || 'outline'}
                size="sm"
                onClick={() => onBulkAction(operation.id)}
                className="flex items-center gap-2"
              >
                {operation.icon}
                {operation.label} ({selectedItems.length})
              </Button>
            ))}

            {/* More Actions Dropdown */}
            {bulkOperations.length > 3 && (
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {bulkOperations.slice(3).map((operation) => (
                    <DropdownMenu.Item
                      key={operation.id}
                      onClick={() => onBulkAction(operation.id)}
                    >
                      {operation.icon}
                      {operation.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </>
        )}

        {/* Export */}
        {exportConfig?.enabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2 ml-auto"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  )
}
```

### 5. Export Functionality

```typescript
// packages/ui/src/collection/exportUtils.ts
import { Schema } from "effect";

export const exportData = <T>(data: T[], format: string, filename?: string) => {
  const baseFilename =
    filename || `export_${new Date().toISOString().split("T")[0]}`;

  switch (format) {
    case "csv":
      exportToCsv(data, `${baseFilename}.csv`);
      break;
    case "xlsx":
      exportToXlsx(data, `${baseFilename}.xlsx`);
      break;
    case "json":
      exportToJson(data, `${baseFilename}.json`);
      break;
    case "pdf":
      exportToPdf(data, `${baseFilename}.pdf`);
      break;
    default:
      console.warn(`Unsupported export format: ${format}`);
  }
};

const exportToCsv = <T>(data: T[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0] as object);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = (row as any)[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : String(value || "");
        })
        .join(","),
    ),
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv");
};

const exportToJson = <T>(data: T[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, "application/json");
};

const exportToXlsx = <T>(data: T[], filename: string) => {
  // Implementation would use a library like xlsx
  console.log("XLSX export not implemented yet");
};

const exportToPdf = <T>(data: T[], filename: string) => {
  // Implementation would use a library like jsPDF
  console.log("PDF export not implemented yet");
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
```

## Implementation Plan

### Week 1: Core Collection Component

- [ ] **Day 1-2**: Create collection configuration types

  - Define `CollectionConfig` interface
  - Create collection state management
  - Set up basic component structure

- [ ] **Day 3-4**: Implement UniversalCollection component

  - Create main collection component
  - Add CRUD operation handling
  - Implement layout configurations

- [ ] **Day 5**: Add collection header and actions
  - Create CollectionHeader component
  - Implement CollectionActions component
  - Add search functionality

### Week 2: Advanced Features

- [ ] **Day 1-2**: Implement bulk operations

  - Add bulk selection handling
  - Create custom bulk action support
  - Implement bulk delete functionality

- [ ] **Day 3-4**: Add export functionality

  - Create export dialog component
  - Implement CSV and JSON export
  - Add custom exporter support

- [ ] **Day 5**: Testing and refinement
  - Test with various schemas and data
  - Add error handling and loading states
  - Performance optimization

## File Structure

```
packages/
├── ui/
│   └── src/
│       └── collection/
│           ├── UniversalCollection.tsx    # Main collection component
│           ├── CollectionHeader.tsx       # Header with search and actions
│           ├── CollectionActions.tsx      # Bulk actions and export
│           ├── ConfirmationDialog.tsx     # Delete confirmation
│           ├── ExportDialog.tsx           # Export format selection
│           ├── exportUtils.ts             # Export functionality
│           ├── types.ts                   # Collection type definitions
│           └── index.ts                   # Public exports
└── shared/
    └── src/
        └── ui/
            └── collectionUtils.ts         # Collection utility functions
```

## Usage Examples

### 1. Basic CRUD Collection

```typescript
const PersonCollection = () => {
  const [people, setPeople] = useState<Person[]>([])

  return (
    <UniversalCollection
      schema={Person}
      title="People"
      description="Manage people in your organization"
      data={people}
      operations={{
        create: {
          enabled: true,
          onSubmit: async (person) => {
            const newPerson = await createPerson(person)
            setPeople(prev => [...prev, newPerson])
          }
        },
        read: {
          enabled: true,
          onRowClick: (person) => navigate(`/people/${person.id}`)
        },
        update: {
          enabled: true,
          onSubmit: async (person) => {
            await updatePerson(person)
            setPeople(prev => prev.map(p => p.id === person.id ? person : p))
          }
        },
        delete: {
          enabled: true,
          onDelete: async (person) => {
            await deletePerson(person.id)
            setPeople(prev => prev.filter(p => p.id !== person.id))
          },
          onBulkDelete: async (people) => {
            await bulkDeletePeople(people.map(p => p.id))
            setPeople(prev => prev.filter(p => !people.some(dp => dp.id === p.id)))
          }
        }
      }}
      search={{
        enabled: true,
        placeholder: "Search people...",
        searchFields: ['firstName', 'lastName', 'email']
      }}
      export={{
        enabled: true,
        formats: ['csv', 'xlsx', 'json'],
        filename: 'people_export'
      }}
    />
  )
}
```

### 2. Collection with Custom Bulk Operations

```typescript
const PersonCollectionWithBulkOps = () => (
  <UniversalCollection
    schema={Person}
    title="People"
    data={people}
    operations={{
      // ... standard CRUD operations
    }}
    bulk={{
      enabled: true,
      operations: [
        {
          id: 'activate',
          label: 'Activate',
          icon: <CheckIcon className="w-4 h-4" />,
          action: async (people) => {
            await bulkActivatePeople(people.map(p => p.id))
            // Refresh data
          },
          variant: 'default'
        },
        {
          id: 'deactivate',
          label: 'Deactivate',
          icon: <XIcon className="w-4 h-4" />,
          action: async (people) => {
            await bulkDeactivatePeople(people.map(p => p.id))
            // Refresh data
          },
          variant: 'outline'
        },
        {
          id: 'export-selected',
          label: 'Export Selected',
          icon: <DownloadIcon className="w-4 h-4" />,
          action: async (people) => {
            exportData(people, 'csv', 'selected_people')
          }
        }
      ]
    }}
    layout={{
      formPosition: 'modal',
      spacing: 'normal'
    }}
  />
)
```

### 3. Side-by-Side Layout Collection

```typescript
const PersonCollectionSideBySide = () => (
  <UniversalCollection
    schema={Person}
    title="People"
    data={people}
    operations={{
      create: {
        enabled: true,
        onSubmit: handleCreate,
        title: "Add New Person",
        formOverrides: {
          bio: { type: "textarea", rows: 3 }, // Override auto-detection
          department: { searchable: true } // Enhance auto-detected select
        }
      },
      read: {
        enabled: true,
        tableOverrides: {
          avatar: {
            cell: ({ getValue, row }) => (
              <Avatar
                src={getValue()}
                alt={`${row.original.firstName} ${row.original.lastName}`}
                size="md"
              />
            )
          }
        }
      },
      update: { enabled: true, onSubmit: handleUpdate },
      delete: { enabled: true, onDelete: handleDelete }
    }}
    layout={{
      formPosition: 'side',
      spacing: 'relaxed'
    }}
    search={{
      enabled: true,
      searchFields: ['firstName', 'lastName', 'email', 'department']
    }}
  />
)
```

## Research References

### Collection Pattern Studies

- **GitHub Repository Analysis**: https://github.com/inato/inato-form
  - Study collection component patterns
  - Analyze form + display integration
  - Review state management approaches

### CRUD Interface Patterns

- **Context7 Search**: "react crud interface patterns"
  - Study modern CRUD interface designs
  - Learn about bulk operation UX patterns
  - Understand export functionality implementations

### Data Management Libraries

- **Context7 Search**: "react data table bulk operations"
  - Study bulk selection patterns
  - Learn about bulk action implementations
  - Understand performance considerations

## Success Metrics

### Developer Experience

- **Setup Time**: <5 minutes to create a full CRUD interface
- **Code Reduction**: 90% less boilerplate for complete data management
- **Customization**: 100% override capability for any aspect

### User Experience

- **Performance**: <100ms response time for all operations
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile Responsive**: Full functionality on all screen sizes

### Feature Coverage

- **CRUD Operations**: Complete Create, Read, Update, Delete support
- **Bulk Operations**: Custom bulk actions with confirmation
- **Export Formats**: CSV, JSON, XLSX, PDF support
- **Search & Filter**: Global search with field-specific filtering

## Risk Mitigation

### Complexity Risks

- **Over-abstraction**: Mitigated by comprehensive override system
- **Performance**: Addressed through virtualization and pagination
- **State Management**: Simplified through clear separation of concerns

### Usability Risks

- **Learning Curve**: Minimized by sensible defaults and examples
- **Customization Limits**: Addressed through escape hatches
- **Mobile Experience**: Ensured through responsive design patterns

## Next Steps

1. **Component Architecture**: Finalize collection component structure
2. **State Management**: Implement robust state handling patterns
3. **Integration Testing**: Test with existing form and table components
4. **Performance Testing**: Validate with large datasets
5. **Documentation**: Create comprehensive usage guides and examples
