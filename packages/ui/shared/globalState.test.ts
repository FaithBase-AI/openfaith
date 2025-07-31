import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  type CollectionView,
  collectionViewMatch,
  getCollectionView,
  setCollectionView,
} from '@openfaith/ui/shared/globalState'
import { Effect, HashMap, pipe } from 'effect'

// Tests for getCollectionView
effect('getCollectionView: should return existing view from HashMap', () =>
  Effect.gen(function* () {
    const views = HashMap.fromIterable([
      ['people', 'table' as CollectionView],
      ['groups', 'cards' as CollectionView],
    ])

    const result = getCollectionView(views, 'people')
    expect(result).toBe('table')
  }),
)

effect('getCollectionView: should return cards view from HashMap', () =>
  Effect.gen(function* () {
    const views = HashMap.fromIterable([
      ['people', 'table' as CollectionView],
      ['groups', 'cards' as CollectionView],
    ])

    const result = getCollectionView(views, 'groups')
    expect(result).toBe('cards')
  }),
)

effect('getCollectionView: should return default view for non-existent key', () =>
  Effect.gen(function* () {
    const views = HashMap.fromIterable([['people', 'cards' as CollectionView]])

    const result = getCollectionView(views, 'nonexistent')
    expect(result).toBe('table') // Default is 'table'
  }),
)

effect('getCollectionView: should return default view for empty HashMap', () =>
  Effect.gen(function* () {
    const views = HashMap.empty<string, CollectionView>()

    const result = getCollectionView(views, 'any-key')
    expect(result).toBe('table') // Default is 'table'
  }),
)

effect('getCollectionView: should handle empty string key', () =>
  Effect.gen(function* () {
    const views = HashMap.fromIterable([['', 'cards' as CollectionView]])

    const result = getCollectionView(views, '')
    expect(result).toBe('cards')
  }),
)

effect('getCollectionView: should handle special characters in key', () =>
  Effect.gen(function* () {
    const views = HashMap.fromIterable([
      ['key-with-dashes', 'cards' as CollectionView],
      ['key_with_underscores', 'table' as CollectionView],
      ['key.with.dots', 'cards' as CollectionView],
    ])

    expect(getCollectionView(views, 'key-with-dashes')).toBe('cards')
    expect(getCollectionView(views, 'key_with_underscores')).toBe('table')
    expect(getCollectionView(views, 'key.with.dots')).toBe('cards')
  }),
)

// Tests for setCollectionView
effect('setCollectionView: should add new view to HashMap', () =>
  Effect.gen(function* () {
    const views = HashMap.empty<string, CollectionView>()

    const result = setCollectionView(views, 'people', 'cards')
    const retrievedView = getCollectionView(result, 'people')

    expect(retrievedView).toBe('cards')
  }),
)

effect('setCollectionView: should update existing view in HashMap', () =>
  Effect.gen(function* () {
    const views = HashMap.fromIterable([['people', 'table' as CollectionView]])

    const result = setCollectionView(views, 'people', 'cards')
    const retrievedView = getCollectionView(result, 'people')

    expect(retrievedView).toBe('cards')
  }),
)

effect('setCollectionView: should not mutate original HashMap', () =>
  Effect.gen(function* () {
    const originalViews = HashMap.fromIterable([['people', 'table' as CollectionView]])

    const updatedViews = setCollectionView(originalViews, 'people', 'cards')

    // Original should remain unchanged
    expect(getCollectionView(originalViews, 'people')).toBe('table')
    // Updated should have new value
    expect(getCollectionView(updatedViews, 'people')).toBe('cards')
  }),
)

effect('setCollectionView: should handle multiple updates', () =>
  Effect.gen(function* () {
    const views = HashMap.empty<string, CollectionView>()

    const result = pipe(
      views,
      (v) => setCollectionView(v, 'people', 'cards'),
      (v) => setCollectionView(v, 'groups', 'table'),
      (v) => setCollectionView(v, 'events', 'cards'),
    )

    expect(getCollectionView(result, 'people')).toBe('cards')
    expect(getCollectionView(result, 'groups')).toBe('table')
    expect(getCollectionView(result, 'events')).toBe('cards')
  }),
)

effect('setCollectionView: should handle empty string key', () =>
  Effect.gen(function* () {
    const views = HashMap.empty<string, CollectionView>()

    const result = setCollectionView(views, '', 'cards')
    const retrievedView = getCollectionView(result, '')

    expect(retrievedView).toBe('cards')
  }),
)

effect('setCollectionView: should handle special characters in key', () =>
  Effect.gen(function* () {
    const views = HashMap.empty<string, CollectionView>()

    const result = pipe(
      views,
      (v) => setCollectionView(v, 'key-with-dashes', 'cards'),
      (v) => setCollectionView(v, 'key_with_underscores', 'table'),
      (v) => setCollectionView(v, 'key.with.dots', 'cards'),
    )

    expect(getCollectionView(result, 'key-with-dashes')).toBe('cards')
    expect(getCollectionView(result, 'key_with_underscores')).toBe('table')
    expect(getCollectionView(result, 'key.with.dots')).toBe('cards')
  }),
)

// Tests for collectionViewMatch
effect('collectionViewMatch: should match table view', () =>
  Effect.gen(function* () {
    const matcher = collectionViewMatch({
      cards: () => 'cards-result',
      table: () => 'table-result',
    })

    const result = matcher('table')
    expect(result).toBe('table-result')
  }),
)

effect('collectionViewMatch: should match cards view', () =>
  Effect.gen(function* () {
    const matcher = collectionViewMatch({
      cards: () => 'cards-result',
      table: () => 'table-result',
    })

    const result = matcher('cards')
    expect(result).toBe('cards-result')
  }),
)

effect('collectionViewMatch: should handle different return types', () =>
  Effect.gen(function* () {
    const numberMatcher = collectionViewMatch({
      cards: () => 2,
      table: () => 1,
    })

    expect(numberMatcher('table')).toBe(1)
    expect(numberMatcher('cards')).toBe(2)

    const booleanMatcher = collectionViewMatch({
      cards: () => false,
      table: () => true,
    })

    expect(booleanMatcher('table')).toBe(true)
    expect(booleanMatcher('cards')).toBe(false)
  }),
)

effect('collectionViewMatch: should handle complex return types', () =>
  Effect.gen(function* () {
    const objectMatcher = collectionViewMatch({
      cards: () => ({ columns: 3, type: 'cards' }),
      table: () => ({ columns: 5, type: 'table' }),
    })

    const tableResult = objectMatcher('table')
    const cardsResult = objectMatcher('cards')

    expect(tableResult).toEqual({ columns: 5, type: 'table' })
    expect(cardsResult).toEqual({ columns: 3, type: 'cards' })
  }),
)

effect('collectionViewMatch: should work with Effect-based functions', () =>
  Effect.gen(function* () {
    const effectMatcher = collectionViewMatch({
      cards: () => Effect.succeed('cards-effect'),
      table: () => Effect.succeed('table-effect'),
    })

    const tableEffect = effectMatcher('table')
    const cardsEffect = effectMatcher('cards')

    const tableResult = yield* tableEffect
    const cardsResult = yield* cardsEffect

    expect(tableResult).toBe('table-effect')
    expect(cardsResult).toBe('cards-effect')
  }),
)

// Integration tests combining multiple functions
effect('Integration: complete workflow with all functions', () =>
  Effect.gen(function* () {
    // Start with empty HashMap
    let views = HashMap.empty<string, CollectionView>()

    // Add some views
    views = setCollectionView(views, 'people', 'cards')
    views = setCollectionView(views, 'groups', 'table')

    // Retrieve and verify
    const peopleView = getCollectionView(views, 'people')
    const groupsView = getCollectionView(views, 'groups')
    const unknownView = getCollectionView(views, 'unknown')

    expect(peopleView).toBe('cards')
    expect(groupsView).toBe('table')
    expect(unknownView).toBe('table') // Default

    // Use matcher with retrieved views
    const peopleResult = collectionViewMatch({
      cards: () => 'people-cards',
      table: () => 'people-table',
    })(peopleView)

    const groupsResult = collectionViewMatch({
      cards: () => 'groups-cards',
      table: () => 'groups-table',
    })(groupsView)

    expect(peopleResult).toBe('people-cards')
    expect(groupsResult).toBe('groups-table')
  }),
)

// Type-level testing
effect('Type validation: CollectionView type is correctly constrained', () =>
  Effect.gen(function* () {
    // Mock function that validates CollectionView type
    const mockViewProcessor = (view: 'table' | 'cards') => view

    // This should compile correctly - validates type structure
    const tableResult = mockViewProcessor('table')
    const cardsResult = mockViewProcessor('cards')

    expect(tableResult).toBe('table')
    expect(cardsResult).toBe('cards')
  }),
)

effect('Type validation: HashMap operations maintain type safety', () =>
  Effect.gen(function* () {
    // Mock function that validates HashMap type structure
    const mockHashMapProcessor = (hashMap: HashMap.HashMap<string, CollectionView>) => hashMap

    const views = HashMap.fromIterable([['test', 'table' as CollectionView]])

    // This should compile correctly - validates type structure
    const result = mockHashMapProcessor(views)
    const retrievedView = pipe(result, HashMap.get('test'), (opt) =>
      opt._tag === 'Some' ? opt.value : ('table' as CollectionView),
    )

    expect(retrievedView).toBe('table')
  }),
)

// Edge cases and error scenarios
effect('Edge case: should handle very long keys', () =>
  Effect.gen(function* () {
    const longKey = 'a'.repeat(1000)
    const views = HashMap.empty<string, CollectionView>()

    const result = setCollectionView(views, longKey, 'cards')
    const retrievedView = getCollectionView(result, longKey)

    expect(retrievedView).toBe('cards')
  }),
)

effect('Edge case: should handle Unicode characters in keys', () =>
  Effect.gen(function* () {
    const unicodeKey = '🚀📊💼'
    const views = HashMap.empty<string, CollectionView>()

    const result = setCollectionView(views, unicodeKey, 'cards')
    const retrievedView = getCollectionView(result, unicodeKey)

    expect(retrievedView).toBe('cards')
  }),
)

effect('Edge case: should handle case-sensitive keys', () =>
  Effect.gen(function* () {
    const views = HashMap.fromIterable([
      ['People', 'cards' as CollectionView],
      ['people', 'table' as CollectionView],
    ])

    expect(getCollectionView(views, 'People')).toBe('cards')
    expect(getCollectionView(views, 'people')).toBe('table')
    expect(getCollectionView(views, 'PEOPLE')).toBe('table') // Default, not found
  }),
)

effect('Performance test: should handle large HashMap efficiently', () =>
  Effect.gen(function* () {
    // Create a large HashMap
    const entries: Array<[string, CollectionView]> = []
    for (let i = 0; i < 1000; i++) {
      entries.push([`key-${i}`, i % 2 === 0 ? 'table' : 'cards'])
    }

    const views = HashMap.fromIterable(entries)

    // Test retrieval performance
    const startTime = Date.now()
    for (let i = 0; i < 100; i++) {
      getCollectionView(views, `key-${i}`)
    }
    const endTime = Date.now()

    // Should complete quickly (less than 100ms for 100 operations)
    expect(endTime - startTime).toBeLessThan(100)

    // Verify correctness
    expect(getCollectionView(views, 'key-0')).toBe('table')
    expect(getCollectionView(views, 'key-1')).toBe('cards')
    expect(getCollectionView(views, 'key-999')).toBe('cards')
  }),
)
