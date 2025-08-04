import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { BuildingIcon } from '@openfaith/ui/icons/buildingIcon'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { FolderPlusIcon } from '@openfaith/ui/icons/folderPlusIcon'

// Import actual icons for testing
import { PersonIcon } from '@openfaith/ui/icons/personIcon'
import { Effect } from 'effect'
// Import the code being tested
import { getIconComponent, IconLoadError } from './iconLoader'

// Test IconLoadError tagged error
effect('IconLoadError should be properly structured tagged error', () =>
  Effect.gen(function* () {
    const error = new IconLoadError({
      cause: new Error('Test cause'),
      iconName: 'testIcon',
    })

    expect(error._tag).toBe('IconLoadError')
    expect(error.iconName).toBe('testIcon')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('IconLoadError should work without optional cause', () =>
  Effect.gen(function* () {
    const error = new IconLoadError({
      iconName: 'testIcon',
    })

    expect(error._tag).toBe('IconLoadError')
    expect(error.iconName).toBe('testIcon')
    expect(error.cause).toBeUndefined()
  }),
)

// Test successful icon loading with different naming conventions
effect('getIconComponent should load icon with PascalCase conversion', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('personIcon')
    expect(IconComponent).toBe(PersonIcon) // Should find PersonIcon via PascalCase conversion
    expect(typeof IconComponent).toBe('function')
  }),
)

effect('getIconComponent should load icon with complex PascalCase conversion', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('folderPlusIcon')
    expect(IconComponent).toBe(FolderPlusIcon) // Should find FolderPlusIcon
    expect(typeof IconComponent).toBe('function')
  }),
)

effect('getIconComponent should load building icon', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('buildingIcon')
    expect(IconComponent).toBe(BuildingIcon)
    expect(typeof IconComponent).toBe('function')
  }),
)

// Test fallback behavior
effect('getIconComponent should fallback to CircleIcon when icon not found', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('nonExistentIcon')
    expect(IconComponent).toBe(CircleIcon)
  }),
)

// Test edge cases with undefined/null iconName
effect('getIconComponent should handle undefined iconName', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent(undefined)
    expect(IconComponent).toBe(CircleIcon)
  }),
)

effect('getIconComponent should handle empty string iconName', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('')
    expect(IconComponent).toBe(CircleIcon) // Should fallback since empty string won't match
  }),
)

// Test caching behavior
effect('getIconComponent should cache loaded icons', () =>
  Effect.gen(function* () {
    // First call should load and cache
    const IconComponent1 = yield* getIconComponent('personIcon')
    expect(IconComponent1).toBe(PersonIcon)

    // Second call should use cache (we can't easily test the import count without mocking,
    // but we can verify the result is consistent)
    const IconComponent2 = yield* getIconComponent('personIcon')
    expect(IconComponent2).toBe(PersonIcon)
    expect(IconComponent1).toBe(IconComponent2) // Should be the same reference
  }),
)

effect('getIconComponent should cache different icons separately', () =>
  Effect.gen(function* () {
    // Load different icons
    const PersonIconComponent = yield* getIconComponent('personIcon')
    const BuildingIconComponent = yield* getIconComponent('buildingIcon')
    const FolderIconComponent = yield* getIconComponent('folderPlusIcon')

    expect(PersonIconComponent).toBe(PersonIcon)
    expect(BuildingIconComponent).toBe(BuildingIcon)
    expect(FolderIconComponent).toBe(FolderPlusIcon)

    // Load them again - should get same references (cached)
    const PersonIconComponent2 = yield* getIconComponent('personIcon')
    const BuildingIconComponent2 = yield* getIconComponent('buildingIcon')
    const FolderIconComponent2 = yield* getIconComponent('folderPlusIcon')

    expect(PersonIconComponent2).toBe(PersonIconComponent)
    expect(BuildingIconComponent2).toBe(BuildingIconComponent)
    expect(FolderIconComponent2).toBe(FolderIconComponent)
  }),
)

effect('getIconComponent should cache fallback CircleIcon', () =>
  Effect.gen(function* () {
    // First call should fallback to CircleIcon and cache it
    const IconComponent1 = yield* getIconComponent('nonExistentIcon')
    expect(IconComponent1).toBe(CircleIcon)

    // Second call should use cached CircleIcon
    const IconComponent2 = yield* getIconComponent('nonExistentIcon')
    expect(IconComponent2).toBe(CircleIcon)
    expect(IconComponent1).toBe(IconComponent2) // Should be the same reference
  }),
)

// Test type validation
effect('Type validation: getIconComponent returns ComponentType', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('personIcon')

    // Type-level validation - should be callable as React component
    expect(typeof IconComponent).toBe('function')

    // Should have displayName property (React component convention)
    expect((IconComponent as any).displayName).toBe('PersonIcon')
  }),
)

// Test concurrent access to cache
effect('getIconComponent should handle concurrent requests correctly', () =>
  Effect.gen(function* () {
    // Make concurrent requests for the same icon
    const [IconComponent1, IconComponent2, IconComponent3] = yield* Effect.all([
      getIconComponent('personIcon'),
      getIconComponent('personIcon'),
      getIconComponent('personIcon'),
    ])

    expect(IconComponent1).toBe(PersonIcon)
    expect(IconComponent2).toBe(PersonIcon)
    expect(IconComponent3).toBe(PersonIcon)

    // All should be the same reference
    expect(IconComponent1).toBe(IconComponent2)
    expect(IconComponent2).toBe(IconComponent3)
  }),
)

// Test naming convention edge cases
effect('getIconComponent should handle single character icon names', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('a')
    expect(IconComponent).toBe(CircleIcon) // Should fallback since 'A' doesn't exist
  }),
)

effect('getIconComponent should handle already PascalCase names', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('PersonIcon')
    expect(IconComponent).toBe(PersonIcon) // Should find exact match first
  }),
)

// Test cache state isolation between tests
effect('Cache should work consistently across test runs', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('buildingIcon')
    expect(IconComponent).toBe(BuildingIcon)
  }),
)

// Test Effect annotations and tracing
effect('getIconComponent should properly annotate spans', () =>
  Effect.gen(function* () {
    // Test that the function runs without errors when annotations are present
    const IconComponent = yield* getIconComponent('personIcon')
    expect(IconComponent).toBe(PersonIcon)

    // Test with undefined iconName to check effectiveIconName annotation
    const CircleIconComponent = yield* getIconComponent(undefined)
    expect(CircleIconComponent).toBe(CircleIcon)
  }),
)

// Test specific naming convention scenarios
effect('getIconComponent should handle icons with numbers in names', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('icon1')
    expect(IconComponent).toBe(CircleIcon) // Should fallback since Icon1 doesn't exist
  }),
)

effect('getIconComponent should handle special characters gracefully', () =>
  Effect.gen(function* () {
    const IconComponent = yield* getIconComponent('icon-with-dashes')
    expect(IconComponent).toBe(CircleIcon) // Should fallback since no match found
  }),
)

// Test error scenarios with tagged errors
effect('IconLoadError should contain correct information', () =>
  Effect.gen(function* () {
    const testError = new Error('Network timeout')

    // Test that IconLoadError can be created with the expected structure
    const iconError = new IconLoadError({
      cause: testError,
      iconName: 'testIcon',
    })

    expect(iconError.iconName).toBe('testIcon')
    expect(iconError.cause).toBe(testError)
    expect(iconError._tag).toBe('IconLoadError')
  }),
)

// Test performance characteristics
effect('getIconComponent should be performant for cached icons', () =>
  Effect.gen(function* () {
    // Load icon once to populate cache
    yield* getIconComponent('personIcon')

    // Measure time for cached access
    const start = Date.now()

    for (let i = 0; i < 100; i++) {
      yield* getIconComponent('personIcon')
    }

    const end = Date.now()
    const duration = end - start

    // Cached access should be very fast (less than 100ms for 100 calls)
    expect(duration).toBeLessThan(100)
  }),
)

// Test that cache persists across different iconName calls
effect('Cache should persist across different icon requests', () =>
  Effect.gen(function* () {
    // Load multiple different icons
    const PersonIconComponent = yield* getIconComponent('personIcon')
    const BuildingIconComponent = yield* getIconComponent('buildingIcon')
    const FolderIconComponent = yield* getIconComponent('folderPlusIcon')

    expect(PersonIconComponent).toBe(PersonIcon)
    expect(BuildingIconComponent).toBe(BuildingIcon)
    expect(FolderIconComponent).toBe(FolderPlusIcon)

    // Access cached icons again
    const PersonIconComponent2 = yield* getIconComponent('personIcon')
    const BuildingIconComponent2 = yield* getIconComponent('buildingIcon')
    const FolderIconComponent2 = yield* getIconComponent('folderPlusIcon')

    // Should be same references (cached)
    expect(PersonIconComponent2).toBe(PersonIconComponent)
    expect(BuildingIconComponent2).toBe(BuildingIconComponent)
    expect(FolderIconComponent2).toBe(FolderIconComponent)
  }),
)

// Test case sensitivity
effect('getIconComponent should handle case sensitivity correctly', () =>
  Effect.gen(function* () {
    // Test camelCase to PascalCase conversion
    const IconComponent1 = yield* getIconComponent('personIcon')
    expect(IconComponent1).toBe(PersonIcon)

    // Test exact PascalCase match
    const IconComponent2 = yield* getIconComponent('PersonIcon')
    expect(IconComponent2).toBe(PersonIcon)

    // Both should return the same component
    expect(IconComponent1).toBe(IconComponent2)
  }),
)

// Test string capitalization logic
effect('getIconComponent should properly capitalize icon names', () =>
  Effect.gen(function* () {
    // Test that folderPlusIcon becomes FolderPlusIcon
    const IconComponent = yield* getIconComponent('folderPlusIcon')
    expect(IconComponent).toBe(FolderPlusIcon)
    expect((IconComponent as any).displayName).toBe('FolderPlusIcon')
  }),
)

// Test fallback consistency
effect('getIconComponent should consistently return CircleIcon for unknown icons', () =>
  Effect.gen(function* () {
    const unknownIcons = [
      'unknownIcon',
      'missingIcon',
      'fakeIcon',
      'testIcon123',
      'icon_with_underscores',
    ]

    for (const iconName of unknownIcons) {
      const IconComponent = yield* getIconComponent(iconName)
      expect(IconComponent).toBe(CircleIcon)
    }
  }),
)

// Test that the function is Effect-based
effect('getIconComponent should be a proper Effect function', () =>
  Effect.gen(function* () {
    // Test that it returns an Effect
    const iconEffect = getIconComponent('personIcon')
    expect(typeof iconEffect).toBe('object')
    expect(iconEffect).toBeDefined()

    // Test that we can compose it with other Effects
    const result = yield* Effect.gen(function* () {
      const IconComponent = yield* getIconComponent('personIcon')
      const anotherResult = yield* Effect.succeed('test')
      return { anotherResult, IconComponent }
    })

    expect(result.IconComponent).toBe(PersonIcon)
    expect(result.anotherResult).toBe('test')
  }),
)

// Test error handling doesn't break the function
effect('getIconComponent should handle errors gracefully', () =>
  Effect.gen(function* () {
    // Even if we pass weird inputs, it should not throw but return CircleIcon
    const results = yield* Effect.all([
      getIconComponent(null as any),
      getIconComponent(undefined),
      getIconComponent(''),
      getIconComponent('   '), // whitespace
      getIconComponent('123'), // starts with number
    ])

    // All should fallback to CircleIcon
    for (const result of results) {
      expect(result).toBe(CircleIcon)
    }
  }),
)
