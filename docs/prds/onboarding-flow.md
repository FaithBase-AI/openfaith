# Onboarding Flow PRD

**Product Requirements Document**  
**Version**: 1.0  
**Date**: January 2025  
**Status**: In Development

## Executive Summary

The OpenFaith onboarding flow is a streamlined, three-step process designed to get new users from sign-up to productive use as quickly as possible. The flow focuses on essential setup tasks: creating an organization, optionally connecting integrations, and verifying email ownership.

## Problem Statement

New users need a clear, simple path to:
- Set up their church organization in the system
- Connect their existing Church Management Systems (ChMS)
- Verify their identity and gain access to the platform
- Minimize time from sign-up to first value

## Goals & Objectives

### Primary Goals
- **Reduce time-to-value**: Get users into the main application within 3-5 minutes
- **Minimize friction**: Only collect essential information during onboarding
- **Enable integrations**: Allow immediate connection to existing ChMS platforms
- **Ensure security**: Verify user email ownership before granting full access

### Success Metrics
- Onboarding completion rate > 80%
- Average time to complete onboarding < 5 minutes
- Integration connection rate > 60% (for users with compatible ChMS)
- Drop-off rate per step < 15%

## User Flow

### Entry Points
1. Post-authentication redirect (new users)
2. Manual navigation for users without organizations
3. Invitation acceptance flow (future)

### Step-by-Step Flow

#### Step 1: Create Organization
**Purpose**: Establish the church/organization entity in the system

**User Actions**:
- Enter organization name
- Enter user email address
- Submit form

**System Actions**:
- Validate organization name (uniqueness, format)
- Validate email format
- Create organization record
- Associate user with organization
- Navigate to Step 2

**Exit Criteria**:
- Organization created successfully
- User associated as admin
- Email captured for verification

#### Step 2: Connect Integrations (Optional)
**Purpose**: Enable data synchronization with existing ChMS platforms

**User Actions**:
- View available integrations
- Select Planning Center (currently available)
- Authenticate with OAuth flow
- Skip step if no integration needed

**System Actions**:
- Display integration options
- Initiate OAuth flow for selected integration
- Store authentication tokens
- Begin initial data sync (async)
- Navigate to Step 3

**Exit Criteria**:
- Integration connected OR
- User explicitly skips step

#### Step 3: Email Verification
**Purpose**: Verify user owns the email address

**User Actions**:
- Check email for verification link
- Click verification link
- Return to application

**System Actions**:
- Send verification email
- Track verification status
- Update user record upon verification
- Redirect to main application

**Exit Criteria**:
- Email verified successfully
- User granted full access

### Post-Onboarding
- Redirect to main dashboard
- Display quick start guide (optional)
- Show integration sync status if applicable

## Technical Requirements

### Architecture
- **Routing**: TanStack Router with file-based routing
- **State Management**: URL search params for step tracking
- **Validation**: Effect Schema for form validation
- **Styling**: Tailwind CSS with consistent design system
- **Data Layer**: Effect-TS patterns throughout

### Component Structure
```
/app/routes/_onboarding/
├── route.tsx          # Layout with gradient sidebar
├── index.tsx          # Main step orchestration
└── /features/onboarding/
    ├── OnboardingProgress.tsx
    ├── OnboardingForm.tsx
    ├── OnboardingEmailVerification.tsx
    └── /integrations/
        └── IntegrationsComponent.tsx
```

### Search Parameter Schema
```typescript
const OnboardingStep = Schema.Union(
  Schema.Struct({ 
    _tag: Schema.Literal('organization') 
  }),
  Schema.Struct({ 
    _tag: Schema.Literal('integrations'),
    orgId: Schema.String,
    email: Schema.String 
  }),
  Schema.Struct({ 
    _tag: Schema.Literal('email-verification'),
    orgId: Schema.String,
    email: Schema.String
  })
)
```

## Design Requirements

### Visual Design
- **Layout**: Split-screen design
  - Left: Emerald gradient sidebar with branding
  - Right: White card-based form area
- **Responsive**: Mobile-first with desktop optimization
- **Progress Indicator**: Clear step visualization
- **Branding**: Consistent with OpenFaith design system

### UI Components
- Progress bar showing current step
- Form cards with clear headers
- Icon indicators for each step
- Action buttons with loading states
- Skip options where applicable

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Clear error messaging
- High contrast ratios

## Integration Requirements

### Planning Center Online (PCO)
- OAuth 2.0 authentication flow
- Scope: Read access to people, groups, giving
- Token storage and refresh handling
- Error recovery for failed connections

### Future Integrations (Marked as "Coming Soon")
- Church Community Builder (CCB)
- Rock RMS
- Breeze
- Subsplash
- Tithely
- Overflow

## Security & Compliance

### Data Protection
- Email verification required before full access
- OAuth tokens encrypted at rest
- No sensitive data collected during onboarding
- HTTPS required for all communications

### Privacy
- Clear data usage disclosure
- Opt-in for marketing communications
- GDPR/CCPA compliance considerations

## Error Handling

### User-Facing Errors
- Clear, actionable error messages
- Retry mechanisms for transient failures
- Support contact information
- Graceful degradation for integration failures

### System Errors
- Comprehensive logging
- Error tracking and monitoring
- Automatic retry for network issues
- Fallback options for critical failures

## Future Enhancements

### Phase 2 Considerations
- Bulk user invitation during onboarding
- Organization profile customization
- Data import tools
- Guided setup based on organization size
- Video tutorials and tooltips

### Phase 3 Considerations
- AI-powered setup recommendations
- Template-based organization structures
- Advanced integration mapping
- Multi-organization support

## Dependencies

### External Services
- Email service for verification
- OAuth providers for integrations
- Analytics tracking (optional)

### Internal Systems
- Authentication service
- Organization management service
- User management service
- Integration sync engine

## Rollout Strategy

### Launch Plan
1. Internal testing with team members
2. Beta testing with 5-10 partner churches
3. Gradual rollout to new signups
4. Full availability

### Success Criteria for Launch
- < 2% error rate
- > 80% completion rate in beta
- Positive user feedback
- All critical integrations functional

## Monitoring & Analytics

### Key Events to Track
- Step completion rates
- Drop-off points
- Time per step
- Integration connection success
- Email verification rates
- Error occurrences

### Dashboards
- Real-time onboarding funnel
- Integration health monitoring
- User feedback collection
- Performance metrics

## Open Questions

1. Should we allow organization creation without email verification?
2. How should we handle users who belong to multiple organizations?
3. What happens if an integration fails after initial connection?
4. Should we offer a "demo mode" for users to explore before committing?
5. How do we handle existing organizations inviting new users?

## Appendix

### Mockups
- [Link to Figma designs] (TBD)
- [Link to prototype] (TBD)

### Technical Specifications
- [API documentation] (TBD)
- [Database schema] (TBD)

### User Research
- [User interview findings] (TBD)
- [Competitive analysis] (TBD)

---

**Document History**
- v1.0 - Initial draft - January 2025