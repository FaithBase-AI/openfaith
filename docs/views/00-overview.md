# Views System - Product Requirements Document

## Executive Summary

The Views System transforms OpenFaith from a basic data display platform into a powerful, user-customizable data exploration tool. Inspired by Airtable's view system, this feature allows users to create, save, and share custom ways of viewing and organizing their church data.

## Problem Statement

**Current State:**
- Users can only view data in basic table or card formats
- No way to save commonly used filter/sort combinations
- Limited customization options for different use cases
- No sharing of data views between team members
- Each time users need specific data views, they must recreate filters manually

**User Pain Points:**
- "I always need to see active volunteers, but I have to set up the same filters every time"
- "Our staff needs different views of the same people data - leadership wants summary cards, admin needs detailed tables"
- "I can't share my useful data configurations with other team members"
- "Different ministries need different ways to organize the same underlying data"

## Vision

Enable church staff to create personalized, shareable data views that adapt to their specific ministry workflows, making data exploration intuitive and efficient.

## Success Metrics

**User Engagement:**
- 80% of active users create at least one custom view within 30 days
- Average of 3+ custom views per active user
- 60% of custom views are used more than once per week

**Productivity:**
- 50% reduction in time spent setting up common data filters
- 40% increase in data exploration activities
- 25% increase in cross-team data sharing

**Feature Adoption:**
- 90% of organizations use shared views
- 70% of users utilize multiple view types (table, cards, kanban)
- 50% of power users create views for multiple entity types

## Core Principles

1. **Familiar Patterns**: Follow established UX patterns from Airtable, Notion, and similar tools
2. **Progressive Disclosure**: Simple by default, powerful when needed
3. **Collaboration First**: Built for team sharing and organizational workflows
4. **Performance**: Fast loading and responsive even with complex configurations
5. **Security**: Respect existing data permissions and add view-level access controls

## User Personas

### **Ministry Leader (Primary)**
- Needs quick access to relevant people/group data for their ministry
- Wants to share views with their team
- Values simplicity and visual organization
- Example: "Active Youth Group Members - Card View"

### **Church Administrator (Primary)**
- Manages complex data across multiple ministries
- Needs detailed, filterable table views
- Creates views for different staff members
- Example: "New Member Follow-up - Detailed Table"

### **Volunteer Coordinator (Secondary)**
- Organizes volunteers by skills, availability, status
- Benefits from kanban-style organization
- Shares views with ministry leaders
- Example: "Volunteer Pipeline - Kanban by Status"

### **Pastor/Leadership (Secondary)**
- High-level overview of church health metrics
- Prefers visual, summary-style views
- Occasional deep-dives into specific data
- Example: "Leadership Dashboard - Summary Cards"

## Technical Architecture Overview

### **Database Schema**
- `collectionViews` table: Core view definitions and configurations
- `collectionViewPermissions` table: Granular sharing permissions
- JSONB configuration storage for flexibility and performance

### **Frontend Architecture**
- Enhanced `UniversalTable` and `Collection` components
- New view management UI components
- Effect-RX state management for view configurations
- Type-safe view configuration schemas

### **Zero Sync Integration**
- Drizzle schema automatically synced through Zero
- Client-side data access through Zero queries and mutations
- Real-time collaboration and offline-first functionality

## Implementation Phases

This system will be delivered in four strategic phases:

### **Phase 1: Named Views Foundation** 
*Target: 6 weeks*
- Database schema and basic CRUD operations
- Save/load view configurations (filters, sorts, columns)
- Simple view selector UI
- Private views only

### **Phase 2: View Types & Display Options**
*Target: 4 weeks*
- Multiple view types (table, cards, kanban, calendar)
- View-specific configuration options
- Enhanced view creation/editing UI

### **Phase 3: Permissions & Sharing**
*Target: 4 weeks*
- View sharing within organizations
- Permission levels (view, edit, admin)
- Default views and system templates

### **Phase 4: Advanced Features**
*Target: 6 weeks*
- View management dashboard
- View templates and duplication
- Advanced view types and customizations
- Performance optimizations

## Risk Assessment

### **High Risk**
- **Performance**: Complex views with multiple filters could impact query performance
- **User Adoption**: Feature complexity might overwhelm less technical users

### **Medium Risk**
- **Data Security**: View sharing must respect existing data permissions
- **Migration**: Existing view preferences need smooth transition

### **Low Risk**
- **Technical Implementation**: Builds on existing, proven architecture
- **UI/UX**: Following established patterns reduces design risk

## Dependencies

### **Technical Dependencies**
- Enhanced Collection/UniversalTable components
- Effect Schema validation for view configurations
- Database migration for new tables

### **Design Dependencies**
- View management UI/UX design
- View type-specific configuration interfaces
- Permission sharing workflows

### **Product Dependencies**
- Existing entity schemas and data structure
- Current permission system integration
- Zero sync compatibility

## Success Criteria

### **Phase 1 Success**
- Users can create and save named views
- 50% of active users create at least one custom view
- View loading performance under 500ms

### **Phase 2 Success**
- All view types functional and performant
- 70% of users try multiple view types
- Positive user feedback on view creation UX

### **Phase 3 Success**
- 60% of organizations use shared views
- Zero security incidents related to view permissions
- Smooth migration of existing view preferences

### **Overall Success**
- 80% user adoption of custom views
- 50% reduction in data setup time
- Positive impact on user engagement metrics
- Foundation ready for advanced features (multi-entity collections)

## Future Considerations

This Views System creates the foundation for more advanced features:
- **Custom Collections**: Multi-entity views spanning different data types
- **Advanced Analytics**: Aggregation and reporting views
- **Workflow Integration**: Views that trigger actions or notifications
- **External Sharing**: Public or external stakeholder view sharing

The architecture and user patterns established here will enable these future capabilities without major rework.
