# Migration Strategy

## Overview

This document outlines the strategy for migrating existing forms and tables to the new schema-driven UI generation system. The approach emphasizes gradual adoption, minimal disruption, and clear migration paths for different types of components.

## Migration Philosophy

### 1. Incremental Adoption

- **No Big Bang**: Migrate components gradually over time
- **Coexistence**: New and old systems work side by side
- **Opt-in**: Teams choose when to migrate specific components
- **Fallback**: Always maintain backward compatibility

### 2. Value-First Migration

- **High-Impact First**: Migrate components with the most repetitive code
- **New Features**: Use schema-driven approach for all new development
- **Pain Points**: Prioritize components that are difficult to maintain

### 3. Risk Mitigation

- **Parallel Development**: Keep existing components functional during migration
- **Testing Strategy**: Comprehensive testing for migrated components
- **Rollback Plan**: Easy rollback if issues arise

## Migration Phases

### Phase 1: Foundation & New Development (Weeks 1-4)

**Goal**: Establish the schema-driven system and use it for all new development

#### Week 1-2: Infrastructure Setup

- [ ] **Create UI annotation system**

  - Implement `UiConfig` annotation symbol
  - Define `FieldConfig` interface
  - Set up TypeScript module augmentation

- [ ] **Build core utilities**
  - Schema introspection functions
  - Field configuration generators
  - Auto-detection fallbacks

#### Week 3-4: Core Components

- [ ] **Implement UniversalForm**

  - Basic form generation
  - Integration with existing `tsForm.ts`
  - Validation system

- [ ] **Implement UniversalTable**
  - Basic table generation
  - TanStack Table integration
  - Cell renderer system

#### New Development Policy

Starting Week 3, all new forms and tables must use the schema-driven approach:

```typescript
// ✅ Required for new development
const NewPersonForm = () => (
  <UniversalForm
    schema={Person}
    onSubmit={handleSubmit}
  />
)

// ❌ No longer allowed for new development
const NewPersonForm = () => {
  const form = useAppForm({...})
  return (
    <form>
      <form.Field name="firstName">
        {/* manual field implementation */}
      </form.Field>
    </form>
  )
}
```

### Phase 2: Schema Enhancement (Weeks 5-8)

**Goal**: Add UI annotations to existing schemas and migrate high-impact components

#### Week 5-6: Schema Annotation

- [ ] **Enhance existing schemas**

  - Add UI annotations to Person schema
  - Add UI annotations to Group schema
  - Add UI annotations to other core CDM schemas

- [ ] **Create migration utilities**
  - Schema annotation helpers
  - Migration validation tools
  - Automated annotation generators

#### Week 7-8: High-Impact Migrations

- [ ] **Migrate person management**

  - Person creation forms
  - Person listing tables
  - Person edit forms

- [ ] **Migrate group management**
  - Group creation forms
  - Group listing tables
  - Group member management

#### Migration Criteria for Phase 2

Prioritize components that:

- Are used frequently across the application
- Have repetitive, boilerplate-heavy code
- Are difficult to maintain or extend
- Would benefit significantly from type safety

### Phase 3: Collection Components (Weeks 9-12)

**Goal**: Implement collection components and migrate complete CRUD interfaces

#### Week 9-10: Collection Implementation

- [ ] **Build UniversalCollection**

  - CRUD operation handling
  - Bulk operations
  - Export functionality

- [ ] **Create collection patterns**
  - Standard collection layouts
  - Custom action patterns
  - Search and filtering

#### Week 11-12: CRUD Migrations

- [ ] **Migrate complete interfaces**

  - Person management interface
  - Group management interface
  - Other entity management interfaces

- [ ] **Add advanced features**
  - Bulk operations
  - Export capabilities
  - Advanced filtering

### Phase 4: Comprehensive Migration (Weeks 13-20)

**Goal**: Migrate remaining components and optimize the system

#### Week 13-16: Systematic Migration

- [ ] **Migrate remaining forms**

  - Settings forms
  - Configuration forms
  - Workflow forms

- [ ] **Migrate remaining tables**
  - Report tables
  - Analytics tables
  - Administrative tables

#### Week 17-20: Optimization & Cleanup

- [ ] **Performance optimization**

  - Bundle size optimization
  - Runtime performance tuning
  - Memory usage optimization

- [ ] **Code cleanup**
  - Remove deprecated components
  - Update documentation
  - Refactor related code

## Migration Patterns

### 1. Form Migration Pattern

#### Before (Existing Pattern)

```typescript
// apps/openfaith/features/people/CreatePersonForm.tsx
const CreatePersonForm = () => {
  const form = useAppForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      // ... more fields
    },
    onSubmit: async ({ value }) => {
      // validation and submission logic
    }
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <form.Field name="firstName">
        {(field) => (
          <InputField
            field={field}
            label="First Name"
            placeholder="Enter first name"
            required
          />
        )}
      </form.Field>

      <form.Field name="lastName">
        {(field) => (
          <InputField
            field={field}
            label="Last Name"
            placeholder="Enter last name"
            required
          />
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <InputField
            field={field}
            label="Email"
            placeholder="Enter email"
            type="email"
            required
          />
        )}
      </form.Field>

      {/* ... many more fields */}

      <button type="submit">Create Person</button>
    </form>
  )
}
```

#### After (Schema-Driven Pattern)

```typescript
// packages/schema/directory/ofPersonSchema.ts (enhanced)
export const Person = Schema.Struct({
  firstName: Schema.String.annotations({
    [UiConfig]: {
      field: {
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter first name',
        required: true
      }
    } satisfies FieldConfig
  }),
  lastName: Schema.String.annotations({
    [UiConfig]: {
      field: {
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter last name',
        required: true
      }
    } satisfies FieldConfig
  }),
  email: Schema.String.annotations({
    [UiConfig]: {
      field: {
        type: 'email',
        label: 'Email',
        placeholder: 'Enter email',
        required: true
      }
    } satisfies FieldConfig
  }),
  // ... other fields with annotations
})

// apps/openfaith/features/people/CreatePersonForm.tsx (migrated)
const CreatePersonForm = () => (
  <UniversalForm
    schema={Person}
    onSubmit={async (person) => {
      await createPerson(person)
    }}
  />
)
```

### 2. Table Migration Pattern

#### Before (Existing Pattern)

```typescript
// apps/openfaith/features/people/PeopleTable.tsx
const PeopleTable = ({ people }: { people: Person[] }) => {
  const columns: ColumnDef<Person>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      size: 150,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      size: 150,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 200,
      cell: ({ getValue }) => {
        const email = getValue() as string
        return <a href={`mailto:${email}`}>{email}</a>
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      size: 100,
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean
        return (
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      }
    },
    // ... more columns
  ]

  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return <TableComponent table={table} />
}
```

#### After (Schema-Driven Pattern)

```typescript
// packages/schema/directory/ofPersonSchema.ts (enhanced with table config)
export const Person = Schema.Struct({
  firstName: Schema.String.annotations({
    [UiConfig]: {
      field: { /* ... */ },
      table: {
        header: 'First Name',
        width: 150,
        sortable: true,
        filterable: true
      }
    } satisfies FieldConfig
  }),
  lastName: Schema.String.annotations({
    [UiConfig]: {
      field: { /* ... */ },
      table: {
        header: 'Last Name',
        width: 150,
        sortable: true,
        filterable: true
      }
    } satisfies FieldConfig
  }),
  email: Schema.String.annotations({
    [UiConfig]: {
      field: { /* ... */ },
      table: {
        header: 'Email',
        width: 200,
        cellType: 'email',
        sortable: true,
        filterable: true
      }
    } satisfies FieldConfig
  }),
  isActive: Schema.Boolean.annotations({
    [UiConfig]: {
      field: { /* ... */ },
      table: {
        header: 'Status',
        width: 100,
        cellType: 'boolean',
        cellConfig: { labels: { true: 'Active', false: 'Inactive' } },
        sortable: true,
        filterable: true
      }
    } satisfies FieldConfig
  }),
  // ... other fields
})

// apps/openfaith/features/people/PeopleTable.tsx (migrated)
const PeopleTable = ({ people }: { people: Person[] }) => (
  <UniversalTable
    schema={Person}
    data={people}
    onRowClick={(person) => navigate(`/people/${person.id}`)}
  />
)
```

### 3. Collection Migration Pattern

#### Before (Existing Pattern)

```typescript
// apps/openfaith/features/people/PeopleManagement.tsx
const PeopleManagement = () => {
  const [people, setPeople] = useState<Person[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2>Add New Person</h2>
        <CreatePersonForm onSubmit={handleCreate} />
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2>People</h2>
        <PeopleTable
          people={people}
          onEdit={setEditingPerson}
          onDelete={handleDelete}
        />
      </div>

      {/* Edit Modal */}
      {editingPerson && (
        <Modal onClose={() => setEditingPerson(null)}>
          <EditPersonForm
            person={editingPerson}
            onSubmit={handleUpdate}
          />
        </Modal>
      )}
    </div>
  )
}
```

#### After (Schema-Driven Pattern)

```typescript
// apps/openfaith/features/people/PeopleManagement.tsx (migrated)
const PeopleManagement = () => {
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
          }
        }
      }}
      search={{
        enabled: true,
        searchFields: ['firstName', 'lastName', 'email']
      }}
      export={{
        enabled: true,
        formats: ['csv', 'json']
      }}
    />
  )
}
```

## Migration Tools

### 1. Schema Annotation Generator

```typescript
// tools/migration/generateAnnotations.ts
import { Schema, SchemaAST } from "effect";

export const generateUiAnnotations = <T>(
  schema: Schema.Schema<T>,
  options: {
    includeTable?: boolean;
    includeForm?: boolean;
    fieldOverrides?: Record<string, Partial<FieldConfig>>;
  } = {},
) => {
  const fields = extractSchemaFields(schema);
  const annotations: Record<string, FieldConfig> = {};

  for (const field of fields) {
    const fieldConfig: FieldConfig = {};

    if (options.includeForm !== false) {
      fieldConfig.field = generateFieldConfig(field);
    }

    if (options.includeTable) {
      fieldConfig.table = generateTableConfig(field);
    }

    // Apply overrides
    if (options.fieldOverrides?.[field.key]) {
      Object.assign(fieldConfig, options.fieldOverrides[field.key]);
    }

    annotations[field.key] = fieldConfig;
  }

  return annotations;
};

// Usage
const personAnnotations = generateUiAnnotations(Person, {
  includeTable: true,
  includeForm: true,
  fieldOverrides: {
    bio: { field: { type: "textarea", rows: 4 } },
  },
});
```

### 2. Migration Validation Tool

```typescript
// tools/migration/validateMigration.ts
export const validateMigration = <T>(
  originalComponent: React.ComponentType,
  migratedComponent: React.ComponentType,
  testData: T[],
) => {
  const results = {
    renderParity: false,
    functionalParity: false,
    performanceParity: false,
    accessibilityParity: false,
  };

  // Render both components and compare output
  // Test functionality with simulated user interactions
  // Measure performance differences
  // Check accessibility compliance

  return results;
};
```

### 3. Automated Migration Assistant

```typescript
// tools/migration/migrationAssistant.ts
export const suggestMigration = (componentPath: string) => {
  const component = analyzeComponent(componentPath);

  if (component.type === "form") {
    return {
      type: "form",
      complexity: calculateComplexity(component),
      estimatedEffort: estimateEffort(component),
      suggestedApproach: "UniversalForm",
      requiredAnnotations: extractRequiredAnnotations(component),
      migrationSteps: generateFormMigrationSteps(component),
    };
  }

  if (component.type === "table") {
    return {
      type: "table",
      complexity: calculateComplexity(component),
      estimatedEffort: estimateEffort(component),
      suggestedApproach: "UniversalTable",
      requiredAnnotations: extractRequiredAnnotations(component),
      migrationSteps: generateTableMigrationSteps(component),
    };
  }

  return null;
};
```

## Migration Checklist

### Pre-Migration Assessment

- [ ] **Identify component type** (form, table, or collection)
- [ ] **Assess complexity** (simple, moderate, complex)
- [ ] **Check dependencies** (what other components depend on this?)
- [ ] **Estimate effort** (hours/days required)
- [ ] **Plan testing strategy** (unit tests, integration tests, manual testing)

### Schema Preparation

- [ ] **Add UI annotations** to relevant schema
- [ ] **Test annotation completeness** (all fields have appropriate config)
- [ ] **Validate annotation correctness** (types match, configs are valid)
- [ ] **Create override configurations** for special cases

### Component Migration

- [ ] **Create new component** using schema-driven approach
- [ ] **Implement custom overrides** for unique requirements
- [ ] **Add error handling** and loading states
- [ ] **Test functionality** thoroughly

### Integration & Testing

- [ ] **Update imports** in parent components
- [ ] **Test integration** with existing systems
- [ ] **Verify performance** (no regressions)
- [ ] **Check accessibility** (WCAG compliance maintained)
- [ ] **Update documentation** and examples

### Cleanup

- [ ] **Remove old component** (after successful migration)
- [ ] **Update related tests** and documentation
- [ ] **Clean up unused dependencies**
- [ ] **Update team knowledge** and training materials

## Risk Management

### Technical Risks

1. **Performance Regression**

   - **Mitigation**: Comprehensive performance testing
   - **Monitoring**: Bundle size and runtime performance metrics
   - **Rollback**: Keep old components until performance is validated

2. **Functionality Loss**

   - **Mitigation**: Thorough functional testing
   - **Monitoring**: User feedback and error tracking
   - **Rollback**: Feature flags for easy rollback

3. **Type Safety Issues**
   - **Mitigation**: Strict TypeScript configuration
   - **Monitoring**: Compile-time error tracking
   - **Rollback**: Gradual migration allows for quick fixes

### Process Risks

1. **Team Resistance**

   - **Mitigation**: Clear benefits demonstration and training
   - **Monitoring**: Team feedback and adoption metrics
   - **Rollback**: Voluntary adoption approach

2. **Migration Complexity**

   - **Mitigation**: Start with simple components
   - **Monitoring**: Migration effort tracking
   - **Rollback**: Pause migration if complexity exceeds estimates

3. **Timeline Pressure**
   - **Mitigation**: Incremental approach with clear milestones
   - **Monitoring**: Progress tracking and regular reviews
   - **Rollback**: Adjust timeline based on actual progress

## Success Metrics

### Migration Progress

- **Components Migrated**: Track number and percentage of migrated components
- **Code Reduction**: Measure lines of code eliminated
- **Schema Coverage**: Percentage of schemas with UI annotations

### Quality Metrics

- **Bug Reports**: Track bugs related to migrated components
- **Performance**: Monitor bundle size and runtime performance
- **Accessibility**: Ensure WCAG compliance is maintained

### Team Metrics

- **Development Speed**: Time to create new forms/tables
- **Maintenance Effort**: Time spent on form/table maintenance
- **Team Satisfaction**: Developer experience surveys

## Timeline Summary

| Phase   | Duration    | Focus                        | Key Deliverables                          |
| ------- | ----------- | ---------------------------- | ----------------------------------------- |
| Phase 1 | Weeks 1-4   | Foundation & New Development | Core components, new development policy   |
| Phase 2 | Weeks 5-8   | Schema Enhancement           | Annotated schemas, high-impact migrations |
| Phase 3 | Weeks 9-12  | Collection Components        | Collection components, CRUD migrations    |
| Phase 4 | Weeks 13-20 | Comprehensive Migration      | Complete migration, optimization          |

**Total Timeline**: 20 weeks (5 months)
**Effort Distribution**: 40% foundation, 30% migration, 20% optimization, 10% cleanup
