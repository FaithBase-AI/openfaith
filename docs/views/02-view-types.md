# Initiative: View Types & Display Options

## Overview

The View Types initiative expands beyond basic table and card views to provide specialized display formats that match different workflow needs. This includes kanban boards for status tracking, calendar views for event management, and enhanced customization options for each view type.

## Problem Statement

Different types of data and workflows require different visualization approaches. A simple table view works well for detailed data analysis, but status tracking needs kanban boards, event planning needs calendar views, and relationship mapping needs different approaches entirely.

## Goals

### Primary Goals
- Implement multiple view types: Table, Cards, Kanban, Calendar
- Create view-type-specific configuration options
- Enable seamless switching between view types for the same data
- Provide intuitive configuration interfaces for each view type

### Success Metrics
- 70% of users try multiple view types within 30 days
- 40% of organizations use kanban views for status-based entities
- 60% of users with date-based entities use calendar views
- Average user creates views in 2+ different view types

## User Stories

### Core User Stories

**As a Volunteer Coordinator, I want to organize volunteers using a kanban board so that I can track their status through the recruitment pipeline.**

*Acceptance Criteria:*
- Can create kanban view with status field as columns
- Can drag volunteers between status columns
- Can customize which fields show on volunteer cards
- Changes persist and sync with other users

**As an Event Planner, I want to view events in a calendar format so that I can see scheduling conflicts and plan effectively.**

*Acceptance Criteria:*
- Can create calendar view using date fields
- Events display with customizable titles and colors
- Can switch between month, week, and day views
- Can filter events while maintaining calendar layout

**As a Ministry Leader, I want to customize card views to show the most relevant information for my team so that we can quickly identify key details.**

*Acceptance Criteria:*
- Can select which fields appear on cards
- Can customize card size and layout
- Can add images/avatars to cards
- Can group cards by relevant categories

**As a Data Administrator, I want to create detailed table views with specific column configurations so that I can analyze data efficiently.**

*Acceptance Criteria:*
- Can show/hide specific columns
- Can reorder columns by dragging
- Can adjust column widths
- Can group rows by any field

### Advanced User Stories

**As a User, I want to convert between view types while preserving relevant configurations so that I can explore the same data in different ways.**

*Acceptance Criteria:*
- Can switch view types for existing named views
- Filters and sorts carry over between view types
- View-specific configurations are preserved separately
- Clear indication of what changes when switching types

## Technical Requirements

### View Type Definitions

```typescript
// Core view types
type ViewType = 'table' | 'cards' | 'kanban' | 'calendar'

// View-specific configuration schemas
interface TableViewConfig {
  columns: {
    visible: Array<string>
    order: Array<string>
    widths: Record<string, number>
  }
  rowHeight: 'compact' | 'medium' | 'large'
  groupBy?: string
  showGroupHeaders: boolean
}

interface CardsViewConfig {
  cardFields: Array<string>
  cardSize: 'small' | 'medium' | 'large'
  cardsPerRow: number
  showImages: boolean
  imageField?: string
  groupBy?: string
}

interface KanbanViewConfig {
  pivotField: string // REQUIRED - field that creates columns
  cardFields: Array<string>
  columnOrder?: Array<string>
  cardSize: 'small' | 'medium' | 'large'
  allowDragDrop: boolean
  showColumnCounts: boolean
}

interface CalendarViewConfig {
  dateField: string // REQUIRED - field containing date
  titleField: string // REQUIRED - field for event title
  colorField?: string // Optional field for color coding
  viewRange: 'month' | 'week' | 'day'
  colorMapping?: Record<string, string>
  showWeekends: boolean
  timeFormat: '12h' | '24h'
}
```

### Enhanced Database Schema

```sql
-- Add view type specific configuration
ALTER TABLE openfaith_collectionViews 
ADD COLUMN viewConfig JSONB; -- View-type-specific settings

-- Update view type enum
ALTER TABLE openfaith_collectionViews 
ALTER COLUMN viewType TYPE TEXT;
-- Constraint will be handled in application layer for flexibility
```

### Component Architecture

```typescript
// Enhanced Collection component with view type routing
interface CollectionProps<TData> {
  // ... existing props
  viewType: ViewType
  viewConfig: ViewTypeConfig
  onViewConfigChange: (config: ViewTypeConfig) => void
}

// View-specific components
interface TableViewProps<TData> {
  data: Array<TData>
  config: TableViewConfig
  onConfigChange: (config: TableViewConfig) => void
}

interface KanbanViewProps<TData> {
  data: Array<TData>
  config: KanbanViewConfig
  onConfigChange: (config: KanbanViewConfig) => void
  onItemMove: (item: TData, newColumn: string) => void
}

interface CalendarViewProps<TData> {
  data: Array<TData>
  config: CalendarViewConfig
  onConfigChange: (config: CalendarViewConfig) => void
  onDateClick: (date: Date) => void
}
```

## Implementation Plan

### Phase 2.1: Enhanced Table & Cards Views (Week 1-2)
- [ ] Implement advanced table configuration options
- [ ] Add column reordering and resizing
- [ ] Enhance card view customization
- [ ] Add grouping support for both view types
- [ ] Create configuration UI components

### Phase 2.2: Kanban View Implementation (Week 2-3)
- [ ] Create KanbanView component with drag-and-drop
- [ ] Implement column generation from pivot field values
- [ ] Add kanban-specific configuration options
- [ ] Handle data updates from drag-and-drop operations
- [ ] Add kanban view creation wizard

### Phase 2.3: Calendar View Implementation (Week 3-4)
- [ ] Create CalendarView component with date navigation
- [ ] Implement event rendering and positioning
- [ ] Add calendar-specific configuration options
- [ ] Handle date field validation and parsing
- [ ] Add calendar view creation wizard

### Phase 2.4: View Type Management (Week 4)
- [ ] Add view type selector to view creation flow
- [ ] Implement view type conversion logic
- [ ] Create view type-specific configuration panels
- [ ] Add validation for required fields per view type
- [ ] Enhance view management UI

## View Type Specifications

### Table View
**Purpose**: Detailed data analysis and bulk operations
**Key Features**:
- Sortable, filterable columns
- Column reordering and resizing
- Row grouping and aggregation
- Bulk selection and actions
- Export capabilities

**Configuration Options**:
- Column visibility and order
- Column widths and alignment
- Row height and density
- Grouping field selection
- Aggregation functions

### Cards View
**Purpose**: Visual overview and relationship identification
**Key Features**:
- Customizable card layouts
- Image/avatar display
- Flexible field selection
- Responsive grid layout
- Card-based actions

**Configuration Options**:
- Fields to display on cards
- Card size and aspect ratio
- Cards per row (responsive)
- Image field selection
- Card template customization

### Kanban View
**Purpose**: Status tracking and workflow management
**Key Features**:
- Drag-and-drop status updates
- Customizable columns based on field values
- Card-based item representation
- Column-specific filtering
- Progress tracking

**Configuration Options**:
- Pivot field selection (required)
- Column order and visibility
- Card fields and layout
- Drag-and-drop permissions
- Column aggregation display

**Required Fields**:
- Must have a field with discrete values for columns
- Field values become kanban columns
- Examples: Status, Priority, Assigned To, Stage

### Calendar View
**Purpose**: Time-based planning and scheduling
**Key Features**:
- Month, week, and day views
- Event color coding
- Date navigation
- Conflict identification
- Time-based filtering

**Configuration Options**:
- Date field selection (required)
- Title field selection (required)
- Color coding field and mapping
- View range (month/week/day)
- Time format and display options

**Required Fields**:
- Must have a date/datetime field
- Must have a text field for event titles
- Optional: field for color coding

## User Experience Flows

### Creating a Kanban View
1. User selects "Create View" → "Kanban View"
2. System prompts for pivot field selection
3. User selects status/category field (e.g., "Volunteer Status")
4. System generates columns from field values
5. User customizes card fields and layout
6. User saves view with descriptive name
7. Kanban board displays with drag-and-drop functionality

### Creating a Calendar View
1. User selects "Create View" → "Calendar View"
2. System prompts for date field selection
3. User selects date field (e.g., "Event Date")
4. System prompts for title field selection
5. User selects title field (e.g., "Event Name")
6. User optionally configures color coding
7. User saves view and sees calendar layout

### Converting Between View Types
1. User opens existing view (e.g., table view of events)
2. User clicks "Change View Type" → "Calendar"
3. System prompts for required calendar fields
4. User maps existing fields to calendar requirements
5. System preserves filters and creates new view
6. User can save as new view or update existing

## Technical Considerations

### Performance Optimization
- Lazy loading of view-specific components
- Virtualization for large datasets in all view types
- Efficient drag-and-drop operations in kanban
- Optimized calendar event rendering
- Caching of view configurations

### Data Validation
- Field type validation for view requirements
- Graceful handling of missing required fields
- Data type conversion where possible
- Clear error messages for invalid configurations

### Responsive Design
- Mobile-optimized view types
- Touch-friendly drag-and-drop
- Responsive card layouts
- Mobile calendar navigation
- Adaptive column counts

### Accessibility
- Keyboard navigation for all view types
- Screen reader support for complex layouts
- High contrast mode compatibility
- Focus management in drag-and-drop operations

## Testing Strategy

### Component Testing
- Individual view type component functionality
- Configuration panel interactions
- Data transformation and display
- Responsive behavior across devices

### Integration Testing
- View type switching and data preservation
- Drag-and-drop operations and data updates
- Calendar navigation and event display
- Filter and sort interactions across view types

### User Testing
- View creation workflows for each type
- Configuration complexity and usability
- Performance with realistic data volumes
- Mobile experience across view types

## Risks & Mitigations

### High Risk: Complexity Overwhelm
**Risk**: Too many options may confuse users
**Mitigation**:
- Progressive disclosure of advanced options
- Smart defaults for each view type
- Guided setup wizards
- Clear documentation and examples

### Medium Risk: Performance Impact
**Risk**: Complex view types may impact performance
**Mitigation**:
- Component virtualization
- Lazy loading strategies
- Performance monitoring
- Optimization based on usage patterns

### Low Risk: Data Compatibility
**Risk**: Not all data types work well with all view types
**Mitigation**:
- Clear field requirements for each view type
- Validation and helpful error messages
- Fallback options for incompatible data

## Success Criteria

### Functional Success
- [ ] All view types render correctly with sample data
- [ ] View type switching preserves relevant configurations
- [ ] Drag-and-drop operations update data correctly
- [ ] Calendar views handle date parsing and display
- [ ] Configuration UIs are intuitive and complete

### User Success
- [ ] 70% of users try multiple view types
- [ ] 90% of kanban views use appropriate status fields
- [ ] 80% of calendar views successfully display events
- [ ] User feedback indicates clear value from different view types

### Performance Success
- [ ] All view types load in under 1 second
- [ ] Drag-and-drop operations feel responsive (<100ms)
- [ ] Calendar navigation is smooth
- [ ] Large datasets (1000+ items) perform acceptably

## Future Enhancements

This foundation enables:
- **Timeline/Gantt Views**: For project management workflows
- **Map Views**: For location-based data
- **Chart Views**: For data visualization and analytics
- **Custom View Types**: User-defined view configurations

The modular architecture established here will support these advanced view types without major refactoring.
