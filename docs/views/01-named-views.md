# Initiative: Named Views Foundation

## Overview

The Named Views Foundation establishes the core infrastructure for saving, loading, and managing custom data views. This is the foundational phase that enables users to create persistent, named configurations of their data display preferences.

## Problem Statement

Users currently lose their filter, sort, and display configurations every time they navigate away from a data collection. This forces them to repeatedly recreate the same data views, leading to inefficiency and frustration.

## Goals

### Primary Goals
- Enable users to save current view configurations with custom names
- Provide persistent storage and retrieval of view configurations
- Create intuitive UI for view selection and management
- Establish technical foundation for advanced view features

### Success Metrics
- 50% of active users create at least one named view within 2 weeks of release
- Average of 2+ named views per active user
- 80% of created views are accessed more than once
- View loading performance under 500ms

## User Stories

### Core User Stories

**As a Ministry Leader, I want to save my commonly used data configurations so that I can quickly access relevant information without recreating filters.**

*Acceptance Criteria:*
- Can save current filter/sort/column configuration with a custom name
- Can access saved views from a dropdown selector
- Saved views persist across browser sessions
- Can modify existing saved views

**As a Church Administrator, I want to create multiple named views for different administrative tasks so that I can efficiently switch between different data perspectives.**

*Acceptance Criteria:*
- Can create multiple views for the same entity type
- Each view maintains independent configuration
- Can set one view as the default for an entity type
- Can rename and delete existing views

**As a User, I want my saved views to load quickly so that switching between views doesn't interrupt my workflow.**

*Acceptance Criteria:*
- Views load in under 500ms
- Smooth transitions between views
- No data loss when switching views
- Loading states provide clear feedback

### Edge Cases

**As a User, I want to handle conflicts when view configurations become invalid so that my saved views remain functional.**

*Acceptance Criteria:*
- Graceful handling of deleted/renamed columns
- Clear error messages for invalid configurations
- Option to update or remove broken views
- Fallback to default configuration when needed

## Technical Requirements

### Database Schema

```sql
-- Core views table
CREATE TABLE openfaith_collectionViews (
  _tag CHAR(14) DEFAULT 'collectionView' NOT NULL,
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Ownership
  orgId TEXT NOT NULL,
  createdBy TEXT NOT NULL,
  
  -- Entity association
  entityType TEXT NOT NULL,
  
  -- View configuration
  viewType TEXT DEFAULT 'table' NOT NULL,
  filterConfig JSONB,
  sortConfig JSONB,
  columnConfig JSONB,
  displayConfig JSONB,
  
  -- Metadata
  visibility TEXT DEFAULT 'private' NOT NULL,
  isDefault BOOLEAN DEFAULT false NOT NULL,
  isSystemDefault BOOLEAN DEFAULT false NOT NULL,
  
  -- Timestamps
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX collectionViewOrgIdx ON openfaith_collectionViews(orgId);
CREATE INDEX collectionViewEntityTypeIdx ON openfaith_collectionViews(entityType);
CREATE INDEX collectionViewOrgEntityIdx ON openfaith_collectionViews(orgId, entityType);
```

### Zero Base Queries

```typescript
// Add to @packages/zero/baseQueries.ts

// Collection Views
export const getBaseCollectionViewsQuery = (z: ReturnType<typeof useZero>) => 
  z.query.collectionViews.orderBy('updatedAt', 'desc')

export const getBaseCollectionViewQuery = (z: ReturnType<typeof useZero>, viewId: string) =>
  getBaseCollectionViewsQuery(z).where('id', viewId).one()

export const getBaseCollectionViewsByEntityQuery = (
  z: ReturnType<typeof useZero>, 
  entityType: string
) => 
  getBaseCollectionViewsQuery(z)
    .where('entityType', entityType)

export const getBaseUserCollectionViewsQuery = (
  z: ReturnType<typeof useZero>,
  userId: string
) =>
  getBaseCollectionViewsQuery(z)
    .where('createdBy', userId)
```

### Zero Data Layer

```typescript
// @apps/openfaith/data/views/collectionViewsData.app.ts
export function useCollectionViewsCollection(entityType: string) {
  const z = useZero()
  
  const [viewsCollection, info] = useQuery(
    getBaseCollectionViewsByEntityQuery(z, entityType)
  )
  
  return {
    loading: info.type !== 'complete',
    viewsCollection: viewsCollection || [],
  }
}

// @apps/openfaith/data/views/collectionViewData.app.ts  
export function useCollectionViewOpt(viewId: string) {
  const z = useZero()
  
  const [view, info] = useQuery(
    getBaseCollectionViewQuery(z, viewId),
    viewId !== ''
  )
  
  return {
    loading: info.type !== 'complete', 
    viewOpt: pipe(view, Option.fromNullable),
  }
}

export function useUserCollectionViews() {
  const z = useZero()
  const userId = useUserId()
  
  const [userViews, info] = useQuery(
    getBaseUserCollectionViewsQuery(z, userId)
  )
  
  return {
    loading: info.type !== 'complete',
    userViewsCollection: userViews || [],
  }
}

// Individual mutation hooks
export function useCreateCollectionView() {
  const z = useZero()
  
  return async (viewData: NewCollectionView) => 
    await z.mutate.collectionViews.insert(viewData)
}

export function useUpdateCollectionView() {
  const z = useZero()
  
  return async (viewId: string, updates: Partial<CollectionView>) =>
    await z.mutate.collectionViews.update({ id: viewId, ...updates })
}

export function useDeleteCollectionView() {
  const z = useZero()
  
  return async (viewId: string) =>
    await z.mutate.collectionViews.delete(viewId)
}

export function useSetDefaultCollectionView() {
  const z = useZero()
  const userId = useUserId()
  
  return async (viewId: string, entityType: string) => {
    // Use Zero's batch API for atomic operations
    await z.mutate.batch(async (tx) => {
      // First, find and unset any existing default for this entity/user
      const existingDefaults = await tx.collectionViews
        .where('entityType', entityType)
        .where('createdBy', userId)
        .where('isDefault', true)
        .toArray()
      
      // Unset existing defaults
      for (const existingDefault of existingDefaults) {
        await tx.collectionViews.update({
          id: existingDefault.id,
          isDefault: false
        })
      }
      
      // Set the new default
      await tx.collectionViews.update({
        id: viewId,
        isDefault: true
      })
    })
  }
}
```

### Frontend Components

```typescript
// Enhanced view selector
interface ViewSelectorProps {
  entityType: string
  currentViewId?: string
  onViewChange: (viewId: string) => void
  onCreateView: () => void
}

// View save dialog
interface SaveViewDialogProps {
  isOpen: boolean
  currentConfig: ViewConfiguration
  onSave: (name: string, description?: string) => void
  onCancel: () => void
}

// View management dropdown
interface ViewManagementProps {
  views: Array<CollectionView>
  currentViewId?: string
  onSelect: (viewId: string) => void
  onEdit: (viewId: string) => void
  onDelete: (viewId: string) => void
  onSetDefault: (viewId: string) => void
}
```

### Configuration Schema

```typescript
// View configuration types
interface ViewConfiguration {
  filterConfig?: {
    filters: Array<FilterDefinition>
    searchTerm?: string
  }
  sortConfig?: {
    sorts: Array<SortDefinition>
  }
  columnConfig?: {
    visibleColumns: Array<string>
    columnOrder: Array<string>
    columnWidths: Record<string, number>
  }
  displayConfig?: {
    rowHeight?: 'compact' | 'medium' | 'large'
    groupBy?: string
  }
}

// Effect Schema validation
const ViewConfigurationSchema = Schema.Struct({
  filterConfig: Schema.optional(FilterConfigSchema),
  sortConfig: Schema.optional(SortConfigSchema),
  columnConfig: Schema.optional(ColumnConfigSchema),
  displayConfig: Schema.optional(DisplayConfigSchema),
})
```

## Implementation Plan

### Phase 1.1: Database & Zero Integration (Week 1-2)
- [ ] Create database migration for collectionViews table
- [ ] Add base queries to @packages/zero/baseQueries.ts
- [ ] Create data layer hooks in @apps/openfaith/data/views/
- [ ] Create Effect schemas for view configuration
- [ ] Add Zero mutation patterns for view operations

### Phase 1.2: Core Frontend Components (Week 2-3)
- [ ] Create ViewSelector component
- [ ] Implement SaveViewDialog component
- [ ] Add view loading/saving logic to UniversalTable
- [ ] Create view configuration serialization/deserialization
- [ ] Add loading states and error handling

### Phase 1.3: Integration & UX (Week 3-4)
- [ ] Integrate view selector into Collection toolbar
- [ ] Add "Save View" button to collection interface
- [ ] Implement view switching logic
- [ ] Add default view handling
- [ ] Create view management dropdown

### Phase 1.4: Polish & Performance (Week 4-6)
- [ ] Optimize view loading performance
- [ ] Add view validation and migration for schema changes
- [ ] Implement proper error boundaries
- [ ] Add comprehensive testing
- [ ] User testing and feedback incorporation

## User Experience Flow

### Creating a Named View
1. User applies filters, sorts, and column configurations to a collection
2. User clicks "Save View" button in toolbar
3. Save dialog opens with current configuration preview
4. User enters view name and optional description
5. View is saved and appears in view selector
6. User can immediately access the saved view

### Using Named Views
1. User opens a collection (People, Groups, etc.)
2. View selector shows available views for that entity type
3. User selects a named view from dropdown
4. Collection updates to show the saved configuration
5. User can modify the view (changes are temporary unless saved)

### Managing Views
1. User clicks manage icon in view selector
2. Management dropdown shows options for current view:
   - Rename view
   - Update view (save current changes)
   - Set as default
   - Delete view
3. User can perform actions with immediate feedback

## Technical Considerations

### Performance
- View configurations stored as JSONB for efficient querying
- Lazy loading of view configurations
- Caching of frequently accessed views
- Optimized database indexes for common queries

### Data Migration
- Existing view preferences (table/cards toggle) migrate to named views
- Default views created for each entity type
- Graceful handling of invalid configurations

### Error Handling
- Validation of view configurations before saving
- Graceful degradation when columns/fields are removed
- Clear error messages for configuration conflicts
- Automatic cleanup of orphaned view configurations

### Security
- Views scoped to organization and user
- Proper authorization for view CRUD operations
- Validation of entity type access permissions
- Protection against malicious configuration injection

## Testing Strategy

### Unit Tests
- View configuration serialization/deserialization
- View validation logic
- API endpoint functionality
- Component rendering and interaction

### Integration Tests
- End-to-end view creation and usage flow
- View switching and persistence
- Error handling and edge cases
- Performance under various data loads

### User Testing
- Usability testing with target personas
- A/B testing of view creation flows
- Performance testing with real data volumes
- Accessibility testing for view management UI

## Risks & Mitigations

### High Risk: User Adoption
**Risk**: Users may not understand or adopt the named views feature
**Mitigation**: 
- Clear onboarding and tutorials
- Default views that demonstrate value
- Progressive disclosure of advanced features

### Medium Risk: Performance Impact
**Risk**: Complex view configurations may slow down data loading
**Mitigation**:
- Performance monitoring and optimization
- Lazy loading of view configurations
- Database query optimization

### Low Risk: Data Migration
**Risk**: Existing user preferences may not migrate cleanly
**Mitigation**:
- Comprehensive migration testing
- Fallback to default configurations
- Clear communication about changes

## Success Criteria

### Functional Success
- [ ] Users can create, save, and load named views
- [ ] View configurations persist across sessions
- [ ] View switching is smooth and performant
- [ ] Error handling is graceful and informative

### User Success
- [ ] 50% of users create at least one named view
- [ ] 80% of created views are used multiple times
- [ ] User feedback is positive (>4.0/5.0 rating)
- [ ] Support tickets related to data filtering decrease by 30%

### Technical Success
- [ ] View loading performance under 500ms
- [ ] Zero data loss incidents
- [ ] 99.9% uptime for view-related functionality
- [ ] Clean, maintainable codebase ready for Phase 2

## Future Considerations

This foundation enables:
- **Phase 2**: Multiple view types (kanban, calendar, etc.)
- **Phase 3**: View sharing and permissions
- **Phase 4**: Advanced view management and templates

The architecture decisions made here should support these future capabilities without major refactoring.
