/**
 * Example of how to use the app-specific mutators
 */

import { createAppMutators } from './mutators'

// Example usage in your app
export function exampleUsage() {
  // Get auth data from your app's auth system
  const authData = {
    activeOrganizationId: 'org-456',
    sub: 'user-123',
  }

  // Create mutators with auth context
  const mutators = createAppMutators(authData)

  // The mutators are now ready to be used with Zero
  // They will be automatically converted from Effect generators to Promise-based functions
  // that Zero can understand, while preserving all Effect benefits like:
  // - Structured error handling
  // - Logging and tracing
  // - Composability
  // - Type safety

  return mutators
}

// Example of how you might use this in a Zero handler
export function createZeroMutatorsForUser(authData: { sub: string; activeOrganizationId: string }) {
  return createAppMutators(authData)
}
