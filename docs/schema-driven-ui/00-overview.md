# Schema-Driven UI Generation

## Overview

This initiative aims to create a comprehensive schema-driven UI generation system for OpenFaith that automatically generates forms and tables from Effect Schema definitions. The system will leverage our existing CDM (Canonical Data Model) and UI components to provide a unified, type-safe approach to building data-driven interfaces.

## Vision

**Single Source of Truth**: Define your data structure once in Effect Schema, and automatically generate both forms and tables with consistent validation, type safety, and UI patterns.

## Architecture Principles

### 1. Effect-First Design

- Built on Effect Schema for data modeling and validation
- Leverages Effect's annotation system for UI configuration
- Integrates seamlessly with existing Effect-based architecture

### 2. Lightweight Abstraction

- Minimal abstraction over TanStack Form and TanStack Table
- Direct access to underlying libraries when customization is needed
- 80% automation, 20% customization approach

### 3. Auto-Detection First Philosophy

- **Schema-driven auto-detection**: Field and cell types automatically inferred from Effect Schema types
- **Minimal annotations**: Only override when auto-detection is insufficient
- **Smart defaults**: Intelligent detection from schema patterns, refinements, and field names
- One `UiConfig` annotation per field containing all UI configuration overrides
- Separate `field` and `table` configuration within the annotation
- Type-safe configuration with TypeScript support

### 4. Framework Integration

- Works with existing `@openfaith/ui` components
- Leverages current TanStack Form infrastructure (`tsForm.ts`)
- Extends existing patterns rather than replacing them

## Core Components

### 1. Schema Annotations

```typescript
const Person = Schema.Struct({
  firstName: Schema.String.annotations({
    [UiConfig]: {
      field: {
        // type: "text" - AUTO-DETECTED from Schema.String
        label: "First Name",
        placeholder: "Enter first name",
        // required: true - AUTO-DETECTED from schema optionality
      },
      table: {
        header: "First Name",
        width: 150,
        // sortable: true - AUTO-DETECTED (default)
        // filterable: true - AUTO-DETECTED (default)
        // cellType: "text" - AUTO-DETECTED from Schema.String
      },
    } satisfies FieldConfig,
  }),

  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  ).annotations({
    [UiConfig]: {
      field: {
        // type: "email" - AUTO-DETECTED from email pattern
        label: "Email Address",
      },
      table: {
        // cellType: "email" - AUTO-DETECTED from email pattern
        header: "Email",
      },
    } satisfies FieldConfig,
  }),

  bio: Schema.String.pipe(Schema.NullOr).annotations({
    [UiConfig]: {
      field: {
        type: "textarea", // Override auto-detection (would be "text")
        label: "Biography",
        rows: 4,
        // required: false - AUTO-DETECTED from Schema.NullOr
      },
    } satisfies FieldConfig,
  }),
});
```

### 2. Universal Form Component

```typescript
<UniversalForm
  schema={Person}
  onSubmit={(person) => handleCreate(person)}
  fieldOverrides={{
    bio: { type: "textarea", rows: 4 } // Override auto-detection
  }}
/>
```

### 3. Universal Table Component

```typescript
<UniversalTable
  schema={Person}
  data={people}
  onRowClick={(person) => handleEdit(person)}
  columnOverrides={{
    salary: { cellType: 'currency' }
  }}
/>
```

### 4. Collection Components

```typescript
<PersonCollection
  schema={Person}
  data={people}
  onAdd={handleCreate}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)

- [ ] Define UI annotation types and symbols
- [ ] Create schema introspection utilities
- [ ] Build auto-detection system for field/cell types
- [ ] Implement smart defaults from schema patterns and field names

### Phase 2: Form Generation (Week 3-4)

- [ ] Implement schema-to-form-fields generator
- [ ] Create UniversalForm component
- [ ] Integrate with existing TanStack Form infrastructure
- [ ] Add validation integration with Effect Schema

### Phase 3: Table Generation (Week 5-6)

- [ ] Implement schema-to-column-definitions generator
- [ ] Create UniversalTable component
- [ ] Build cell renderer mapping system
- [ ] Add sorting, filtering, and pagination support

### Phase 4: Collection Components (Week 7-8)

- [ ] Combine form + table into unified collection views
- [ ] Implement CRUD operations with Effect workflows
- [ ] Add advanced features (bulk operations, export)
- [ ] Create reusable collection patterns

### Phase 5: Migration & Documentation (Week 9-10)

- [ ] Create migration guides for existing components
- [ ] Build comprehensive documentation and examples
- [ ] Performance optimization and testing
- [ ] Team training and adoption support

## Research References

### Effect Schema Documentation

- **Effect-MCP Search**: "Schema annotations AST introspection"
- **Effect-MCP Search**: "Schema AST getAnnotation introspection fields"
- **Effect-MCP Search**: "Schema to JSON Schema generation"

### TanStack Integration

- **Context7 Search**: "tanstack form field types and validation"
- **Context7 Search**: "tanstack table column definitions and types"
- **Context7 Search**: "tanstack form react hook form integration"

### Inspiration Libraries

- **GitHub Repository**: https://github.com/inato/inato-form
  - Study FormField pattern and Effect Layer system
  - Analyze FormBody structure and FormDisplay generation
  - Review framework abstraction patterns

## Success Metrics

### Developer Experience

- **Reduced Boilerplate**: 80% reduction in form/table code for standard CRUD operations
- **Type Safety**: 100% type safety from schema to UI components
- **Consistency**: Uniform UI patterns across all generated components

### Performance

- **Bundle Size**: Minimal impact on bundle size (<50KB additional)
- **Runtime Performance**: No significant performance degradation
- **Development Speed**: 3x faster development for data-driven interfaces

### Adoption

- **Team Adoption**: 80% of new forms/tables use schema-driven generation
- **Migration**: 50% of existing components migrated within 6 months
- **Documentation**: Comprehensive guides and examples available

## Risk Mitigation

### Technical Risks

- **Over-abstraction**: Mitigated by lightweight approach and direct library access
- **Performance**: Addressed through lazy loading and optimization
- **Complexity**: Managed through incremental adoption and clear documentation

### Adoption Risks

- **Learning Curve**: Minimized by building on existing patterns
- **Resistance to Change**: Addressed through gradual migration and clear benefits
- **Maintenance Burden**: Reduced through comprehensive testing and documentation

## Next Steps

1. **Review and Approve**: Team review of this specification
2. **Detailed Planning**: Create detailed implementation plans for each phase
3. **Prototype Development**: Build proof-of-concept for Phase 1
4. **Team Alignment**: Ensure all team members understand the approach
5. **Begin Implementation**: Start with Phase 1 foundation work

## Related Documents

- [01-form-generation.md](./01-form-generation.md) - Detailed form generation specification
- [02-table-generation.md](./02-table-generation.md) - Detailed table generation specification
- [03-collection-components.md](./03-collection-components.md) - Collection component specification
- [04-migration-strategy.md](./04-migration-strategy.md) - Migration strategy and timeline
