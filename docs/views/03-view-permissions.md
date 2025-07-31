# Initiative: View Permissions & Sharing

## Overview

The View Permissions initiative enables collaborative data exploration by allowing users to share their custom views with team members, set appropriate access levels, and manage organizational view libraries. This transforms views from personal tools into collaborative assets.

## Problem Statement

Currently, valuable data configurations created by experienced users remain isolated and cannot be shared with team members who would benefit from them. This leads to duplicated effort, inconsistent data interpretation, and missed opportunities for organizational learning.

## Goals

### Primary Goals
- Enable secure sharing of views within organizations
- Implement granular permission levels for view access
- Create organizational view libraries and templates
- Establish default views for new users and entity types

### Success Metrics
- 60% of organizations have at least one shared view
- 40% of users access views created by others
- 30% reduction in duplicate view creation
- 80% of new users start with helpful default views

## User Stories

### Core User Stories

**As a Ministry Leader, I want to share my useful data views with my team so that everyone can access the same organized information.**

*Acceptance Criteria:*
- Can share views with specific users or roles
- Can set permission levels (view-only, edit, admin)
- Shared views appear in recipients' view selectors
- Changes to shared views are visible to all users with access

**As a Church Administrator, I want to create organizational default views so that new staff members start with helpful data configurations.**

*Acceptance Criteria:*
- Can mark views as organizational defaults
- New users automatically get access to default views
- Can create role-specific default views
- Can update default views for all users

**As a Team Member, I want to access views shared with me so that I can benefit from others' data expertise.**

*Acceptance Criteria:*
- Shared views appear clearly marked in view selector
- Can see who created and shared each view
- Can use shared views without affecting others
- Can create personal copies of shared views

**As a View Creator, I want to control who can access and modify my shared views so that I can maintain data integrity.**

*Acceptance Criteria:*
- Can set different permission levels for different users
- Can revoke access to shared views
- Can see who has access to my views
- Can transfer ownership of views to others

### Advanced User Stories

**As an Organization Admin, I want to manage view permissions at scale so that I can ensure appropriate data access across the organization.**

*Acceptance Criteria:*
- Can see all views in the organization
- Can modify permissions on any view
- Can create organization-wide view policies
- Can audit view access and usage

## Technical Requirements

### Enhanced Database Schema

```sql
-- Add visibility and sharing fields to existing table
ALTER TABLE openfaith_collectionViews 
ADD COLUMN visibility TEXT DEFAULT 'private' NOT NULL,
ADD COLUMN sharedWithOrg BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN isOrgDefault BOOLEAN DEFAULT false NOT NULL;

-- Create permissions table for granular access control
CREATE TABLE openfaith_collectionViewPermissions (
  _tag CHAR(14) DEFAULT 'viewPermission' NOT NULL,
  id TEXT PRIMARY KEY,
  viewId TEXT NOT NULL REFERENCES openfaith_collectionViews(id) ON DELETE CASCADE,
  
  -- Permission target (user or role-based)
  userId TEXT, -- Specific user permission
  role TEXT, -- Role-based permission ('admin', 'member', 'owner')
  
  -- Permission level
  permission TEXT NOT NULL, -- 'view', 'edit', 'admin'
  
  -- Metadata
  grantedBy TEXT NOT NULL, -- userId who granted permission
  createdAt TIMESTAMP NOT NULL,
  
  -- Ensure either userId or role is specified, not both
  CONSTRAINT check_permission_target CHECK (
    (userId IS NOT NULL AND role IS NULL) OR 
    (userId IS NULL AND role IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX viewPermissionViewIdx ON openfaith_collectionViewPermissions(viewId);
CREATE INDEX viewPermissionUserIdx ON openfaith_collectionViewPermissions(userId);
CREATE INDEX viewPermissionRoleIdx ON openfaith_collectionViewPermissions(role);

-- View sharing audit log
CREATE TABLE openfaith_viewSharingAudit (
  id TEXT PRIMARY KEY,
  viewId TEXT NOT NULL,
  action TEXT NOT NULL, -- 'shared', 'unshared', 'permission_changed'
  performedBy TEXT NOT NULL,
  targetUser TEXT,
  targetRole TEXT,
  oldPermission TEXT,
  newPermission TEXT,
  createdAt TIMESTAMP NOT NULL
);
```

### Permission Levels

```typescript
type ViewPermission = 'view' | 'edit' | 'admin'

interface PermissionCapabilities {
  view: {
    canAccess: true
    canUse: true
    canCopy: true
    canModify: false
    canShare: false
    canDelete: false
  }
  edit: {
    canAccess: true
    canUse: true
    canCopy: true
    canModify: true
    canShare: false
    canDelete: false
  }
  admin: {
    canAccess: true
    canUse: true
    canCopy: true
    canModify: true
    canShare: true
    canDelete: true
  }
}
```

### Zero Base Queries & Data Layer

```typescript
// Add to @packages/zero/baseQueries.ts

// Collection View Permissions  
export const getBaseCollectionViewPermissionsQuery = (z: ReturnType<typeof useZero>) =>
  z.query.collectionViewPermissions

export const getBaseCollectionViewPermissionsByViewQuery = (
  z: ReturnType<typeof useZero>,
  viewId: string
) =>
  getBaseCollectionViewPermissionsQuery(z).where('viewId', viewId)

export const getBaseSharedViewsQuery = (
  z: ReturnType<typeof useZero>,
  userId: string
) =>
  z.query.collectionViews
    .related('permissions')
    .where((view) => 
      view.visibility === 'org' || 
      view.permissions.some(p => p.userId === userId)
    )

export const getBaseOrgDefaultViewsQuery = (
  z: ReturnType<typeof useZero>
) =>
  z.query.collectionViews
    .where('isOrgDefault', true)

// Data layer hooks
// @apps/openfaith/data/views/viewPermissionsData.app.ts
export function useViewPermissions(viewId: string) {
  const z = useZero()
  
  const [permissions, info] = useQuery(
    getBaseCollectionViewPermissionsByViewQuery(z, viewId),
    viewId !== ''
  )
  
  return {
    loading: info.type !== 'complete',
    permissions: permissions || [],
  }
}

export function useSharedViews() {
  const z = useZero()
  const userId = useUserId()
  
  const [sharedViews, info] = useQuery(
    getBaseSharedViewsQuery(z, userId)
  )
  
  return {
    loading: info.type !== 'complete',
    sharedViewsCollection: sharedViews || [],
  }
}

// Individual permission mutation hooks
export function useShareCollectionView() {
  const z = useZero()
  
  return async (permission: NewCollectionViewPermission) =>
    await z.mutate.collectionViewPermissions.insert(permission)
}

export function useUpdateViewPermission() {
  const z = useZero()
  
  return async (permissionId: string, newLevel: ViewPermission) =>
    await z.mutate.collectionViewPermissions.update({
      id: permissionId,
      permission: newLevel
    })
}

export function useRevokeViewPermission() {
  const z = useZero()
  
  return async (permissionId: string) =>
    await z.mutate.collectionViewPermissions.delete(permissionId)
}

export function useCopyCollectionView() {
  const z = useZero()
  const userId = useUserId()
  
  return async (originalView: CollectionView) => {
    return await z.mutate.collectionViews.insert({
      ...originalView,
      id: generateId(),
      name: `${originalView.name} (Copy)`,
      createdBy: userId,
      visibility: 'private',
      isDefault: false,
      isOrgDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}
```

### Frontend Components

```typescript
// View sharing dialog
interface ViewSharingDialogProps {
  view: CollectionView
  isOpen: boolean
  onClose: () => void
  onShare: (targets: ShareTarget[], permission: ViewPermission) => void
}

interface ShareTarget {
  type: 'user' | 'role'
  id: string
  name: string
}

// Permission management component
interface ViewPermissionsProps {
  viewId: string
  permissions: Array<ViewPermissionWithDetails>
  onUpdatePermission: (permissionId: string, newLevel: ViewPermission) => void
  onRevokePermission: (permissionId: string) => void
  onAddPermission: (target: ShareTarget, permission: ViewPermission) => void
}

// Enhanced view selector with sharing indicators
interface ViewSelectorItemProps {
  view: CollectionView
  isShared: boolean
  isOwned: boolean
  sharedBy?: string
  permission?: ViewPermission
}
```

## Implementation Plan

### Phase 3.1: Basic Sharing Infrastructure (Week 1-2)
- [ ] Create view permissions database tables
- [ ] Add permission base queries to Zero
- [ ] Create permission data layer hooks
- [ ] Create basic sharing UI components
- [ ] Add view ownership and access validation through Zero

### Phase 3.2: Sharing UI & User Experience (Week 2-3)
- [ ] Create view sharing dialog
- [ ] Add sharing indicators to view selector
- [ ] Implement permission management interface
- [ ] Add "shared with me" view section
- [ ] Create view copying functionality

### Phase 3.3: Organizational Features (Week 3-4)
- [ ] Implement organizational default views
- [ ] Add role-based sharing capabilities
- [ ] Create organization view management dashboard
- [ ] Add bulk permission management
- [ ] Implement view usage analytics

### Phase 3.4: Advanced Permissions & Audit (Week 4)
- [ ] Add view sharing audit logging
- [ ] Implement advanced permission policies
- [ ] Create permission inheritance system
- [ ] Add view access reporting
- [ ] Implement automated permission cleanup

## Permission System Design

### Visibility Levels

```typescript
type ViewVisibility = 'private' | 'org' | 'public'

interface VisibilityRules {
  private: {
    // Only creator can see and use
    defaultAccess: 'none'
    requiresExplicitPermission: true
  }
  org: {
    // All org members can see, creator controls edit access
    defaultAccess: 'view'
    requiresExplicitPermission: false
  }
  public: {
    // All org members can see and edit
    defaultAccess: 'edit'
    requiresExplicitPermission: false
  }
}
```

### Permission Inheritance

```typescript
// Permission resolution order (highest to lowest priority)
const permissionResolution = [
  'explicit_user_permission',    // Direct user permission
  'explicit_role_permission',    // Role-based permission
  'org_default_permission',      // Organization default
  'view_visibility_default',     // View visibility setting
  'no_access'                    // Default deny
]
```

### Default View System

```typescript
interface DefaultViewConfig {
  entityType: string
  viewId: string
  scope: 'user' | 'role' | 'org'
  targetRole?: string
  priority: number // Higher priority overrides lower
}

// Default view resolution for new users
const getDefaultViews = (user: User, entityType: string) => {
  const candidates = [
    ...getUserDefaultViews(user.id, entityType),
    ...getRoleDefaultViews(user.roles, entityType),
    ...getOrgDefaultViews(user.orgId, entityType),
    ...getSystemDefaultViews(entityType)
  ]
  
  return candidates.sort((a, b) => b.priority - a.priority)
}
```

## User Experience Flows

### Sharing a View
1. User opens view management menu
2. Selects "Share View" option
3. Sharing dialog opens with user/role selector
4. User selects recipients and permission level
5. System validates permissions and sends invitations
6. Recipients see shared view in their view selector
7. Creator can monitor and manage sharing

### Accessing Shared Views
1. User opens view selector for entity type
2. Shared views appear in separate "Shared with me" section
3. Views show creator name and permission level
4. User can use shared view normally
5. User can create personal copy if desired
6. Changes respect permission levels

### Setting Organizational Defaults
1. Admin opens organization view management
2. Selects entity type and target audience
3. Chooses existing view or creates new default
4. Sets priority and scope (all users, specific roles)
5. New users automatically get default views
6. Existing users can opt-in to new defaults

## Security Considerations

### Data Access Validation
- Views must respect underlying data permissions
- Row-level security applies to all view access
- Field-level permissions override view configurations
- Audit trail for all view access and modifications

### Permission Escalation Prevention
- Users cannot grant permissions they don't have
- View sharing cannot bypass data access controls
- Organization admins have override capabilities
- Regular permission audits and cleanup

### Privacy Protection
- Clear indication of shared vs private views
- User consent for view sharing
- Ability to revoke sharing at any time
- Data anonymization in shared analytics

## Testing Strategy

### Security Testing
- Permission boundary testing
- Data access validation
- Permission escalation attempts
- Cross-organization access prevention

### User Experience Testing
- Sharing workflow usability
- Permission level understanding
- Default view effectiveness
- Collaboration scenarios

### Performance Testing
- Permission checking overhead
- Large organization scaling
- View access query optimization
- Audit log performance impact

## Risks & Mitigations

### High Risk: Data Security
**Risk**: Shared views might expose sensitive data inappropriately
**Mitigation**:
- Strict permission validation at all levels
- Regular security audits
- Clear data access policies
- User education on sharing implications

### Medium Risk: Permission Complexity
**Risk**: Complex permission system may confuse users
**Mitigation**:
- Clear permission level descriptions
- Visual permission indicators
- Simplified sharing workflows
- Comprehensive documentation

### Low Risk: Performance Impact
**Risk**: Permission checking may slow down view access
**Mitigation**:
- Efficient permission caching
- Optimized database queries
- Performance monitoring
- Lazy loading of permission details

## Success Criteria

### Functional Success
- [ ] Users can share views with appropriate permissions
- [ ] Permission levels work as designed
- [ ] Default views are automatically assigned
- [ ] Audit trail captures all sharing activities

### User Success
- [ ] 60% of organizations use shared views
- [ ] 90% of users understand permission levels
- [ ] Positive feedback on collaboration features
- [ ] Reduced duplicate view creation

### Security Success
- [ ] Zero unauthorized data access incidents
- [ ] All permission changes properly audited
- [ ] Regular security reviews pass
- [ ] User privacy expectations met

## Future Enhancements

This foundation enables:
- **External Sharing**: Views shared outside organization
- **View Templates**: Reusable view configurations
- **Advanced Analytics**: View usage and collaboration metrics
- **Integration APIs**: Third-party access to shared views

The permission system established here will support these advanced features while maintaining security and usability.
