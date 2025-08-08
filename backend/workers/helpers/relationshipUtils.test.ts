import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  compressPairs,
  compressRelationshipInputs,
  expandBidirectionalPairs,
  groupPairsBySource,
  type RelationshipInput,
} from '@openfaith/workers/helpers/relationshipUtils'
import { Array, Effect, pipe } from 'effect'

effect('expandBidirectionalPairs: handles simple one-to-one', () =>
  Effect.gen(function* () {
    const input: ReadonlyArray<RelationshipInput> = [
      { sourceEntityTypeTag: 'user', targetEntityTypeTags: ['person'] },
    ]
    const pairs = yield* expandBidirectionalPairs(input)
    // Should contain both directions
    expect(pairs).toContainEqual(['user', 'person'])
    expect(pairs).toContainEqual(['person', 'user'])
    expect(pairs).toHaveLength(2)
  }),
)

effect('expandBidirectionalPairs: self relationships produce single pair', () =>
  Effect.gen(function* () {
    const input: ReadonlyArray<RelationshipInput> = [
      { sourceEntityTypeTag: 'person', targetEntityTypeTags: ['person'] },
    ]
    const pairs = yield* expandBidirectionalPairs(input)
    // Self-relationship should only produce one pair
    expect(pairs).toEqual([['person', 'person']])
  }),
)

effect('expandBidirectionalPairs: handles multiple targets with compression', () =>
  Effect.gen(function* () {
    const input: ReadonlyArray<RelationshipInput> = [
      { sourceEntityTypeTag: 'person', targetEntityTypeTags: ['address', 'phoneNumber'] },
    ]
    const pairs = yield* expandBidirectionalPairs(input)
    // Should create bidirectional pairs for each target
    expect(pairs).toContainEqual(['person', 'address'])
    expect(pairs).toContainEqual(['address', 'person'])
    expect(pairs).toContainEqual(['person', 'phoneNumber'])
    expect(pairs).toContainEqual(['phoneNumber', 'person'])
    expect(pairs).toHaveLength(4)
  }),
)

effect('compressPairs: removes duplicates while preserving order', () =>
  Effect.gen(function* () {
    const pairsRaw: ReadonlyArray<readonly [string, string]> = [
      ['person', 'person'],
      ['person', 'person'], // duplicate
      ['person', 'address'],
      ['address', 'person'],
      ['person', 'address'], // duplicate
    ]
    const pairs = yield* compressPairs(pairsRaw)
    expect(pairs).toEqual([
      ['person', 'person'],
      ['person', 'address'],
      ['address', 'person'],
    ])
  }),
)

effect('groupPairsBySource: groups and de-duplicates targets', () =>
  Effect.gen(function* () {
    const pairsRaw: ReadonlyArray<readonly [string, string]> = [
      ['person', 'person'],
      ['person', 'person'],
      ['person', 'address'],
      ['address', 'person'],
    ]
    const pairs = yield* compressPairs(pairsRaw)
    const grouped = yield* groupPairsBySource(pairs)

    const personGroup = pipe(
      grouped,
      Array.findFirst((g) => g.sourceEntityType === 'person'),
    )
    expect(personGroup._tag).toBe('Some')
    if (personGroup._tag === 'Some') {
      expect(personGroup.value.targetEntityTypes).toContain('person')
      expect(personGroup.value.targetEntityTypes).toContain('address')
      expect(personGroup.value.targetEntityTypes).toHaveLength(2)
    }

    const addressGroup = pipe(
      grouped,
      Array.findFirst((g) => g.sourceEntityType === 'address'),
    )
    expect(addressGroup._tag).toBe('Some')
    if (addressGroup._tag === 'Some') {
      expect(addressGroup.value.targetEntityTypes).toEqual(['person'])
    }
  }),
)

effect('compressRelationshipInputs: merges duplicate sources', () =>
  Effect.gen(function* () {
    const inputs: ReadonlyArray<RelationshipInput> = [
      { sourceEntityTypeTag: 'person', targetEntityTypeTags: ['address'] },
      { sourceEntityTypeTag: 'person', targetEntityTypeTags: ['phoneNumber'] },
      { sourceEntityTypeTag: 'group', targetEntityTypeTags: ['person'] },
    ]

    const compressed = yield* compressRelationshipInputs(inputs)

    // Should have 2 entries: one for person, one for group
    expect(compressed).toHaveLength(2)

    const personInput = pipe(
      compressed,
      Array.findFirst((input) => input.sourceEntityTypeTag === 'person'),
    )
    expect(personInput._tag).toBe('Some')
    if (personInput._tag === 'Some') {
      expect(personInput.value.targetEntityTypeTags).toContain('address')
      expect(personInput.value.targetEntityTypeTags).toContain('phoneNumber')
      expect(personInput.value.targetEntityTypeTags).toHaveLength(2)
    }

    const groupInput = pipe(
      compressed,
      Array.findFirst((input) => input.sourceEntityTypeTag === 'group'),
    )
    expect(groupInput._tag).toBe('Some')
    if (groupInput._tag === 'Some') {
      expect(groupInput.value.targetEntityTypeTags).toEqual(['person'])
    }
  }),
)

effect('end-to-end: compress inputs, expand pairs, group by source', () =>
  Effect.gen(function* () {
    // Multiple inputs with duplicates
    const inputs: ReadonlyArray<RelationshipInput> = [
      { sourceEntityTypeTag: 'person', targetEntityTypeTags: ['address'] },
      { sourceEntityTypeTag: 'person', targetEntityTypeTags: ['phoneNumber', 'address'] }, // duplicate address
      { sourceEntityTypeTag: 'person', targetEntityTypeTags: ['person'] }, // self-relationship
    ]

    // First compress the inputs
    const compressedInputs = yield* compressRelationshipInputs(inputs)
    expect(compressedInputs).toHaveLength(1) // All person sources merged

    // Then expand to bidirectional pairs
    const pairs = yield* expandBidirectionalPairs(compressedInputs)

    // Should have unique pairs only
    expect(pairs).toContainEqual(['person', 'person']) // self-relationship (1 pair)
    expect(pairs).toContainEqual(['person', 'address'])
    expect(pairs).toContainEqual(['address', 'person'])
    expect(pairs).toContainEqual(['person', 'phoneNumber'])
    expect(pairs).toContainEqual(['phoneNumber', 'person'])

    // Finally group by source
    const grouped = yield* groupPairsBySource(pairs)

    // Check person group
    const personGroup = pipe(
      grouped,
      Array.findFirst((g) => g.sourceEntityType === 'person'),
    )
    expect(personGroup._tag).toBe('Some')
    if (personGroup._tag === 'Some') {
      expect(personGroup.value.targetEntityTypes).toContain('person')
      expect(personGroup.value.targetEntityTypes).toContain('address')
      expect(personGroup.value.targetEntityTypes).toContain('phoneNumber')
      expect(personGroup.value.targetEntityTypes).toHaveLength(3)
    }
  }),
)
