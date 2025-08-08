import { Array, Effect, HashSet, pipe, Record } from 'effect'

export type RelationshipInput = {
  readonly sourceEntityTypeTag: string
  readonly targetEntityTypeTags: ReadonlyArray<string>
}

export type RelationshipPair = readonly [source: string, target: string]

export type GroupedRelationships = ReadonlyArray<{
  readonly sourceEntityType: string
  readonly targetEntityTypes: ReadonlyArray<string>
}>

/**
 * Expands relationship inputs into bidirectional pairs with automatic compression.
 * - Self-relationships (e.g., person -> person) produce only one pair
 * - Different relationships produce bidirectional pairs
 * - Automatically deduplicates identical pairs
 */
export const expandBidirectionalPairs = Effect.fn('expandBidirectionalPairs')(function* (
  relationships: ReadonlyArray<RelationshipInput>,
) {
  // Use HashSet to automatically deduplicate pairs
  const pairSet = pipe(
    relationships,
    Array.flatMap((rel) =>
      pipe(
        rel.targetEntityTypeTags,
        Array.flatMap((target) => {
          // For self-relationships, only create one pair
          if (rel.sourceEntityTypeTag === target) {
            return [[rel.sourceEntityTypeTag, target] as RelationshipPair]
          }
          // For different entities, create bidirectional pairs
          return [
            [rel.sourceEntityTypeTag, target] as RelationshipPair,
            [target, rel.sourceEntityTypeTag] as RelationshipPair,
          ]
        }),
      ),
    ),
    // Convert to HashSet to deduplicate based on pair equality
    (pairs) =>
      HashSet.fromIterable(
        pipe(
          pairs,
          Array.map((pair) => `${pair[0]}|${pair[1]}`),
        ),
      ),
    // Convert back to pairs
    HashSet.toValues,
    Array.map((key) => {
      const parts = key.split('|')
      return [parts[0]!, parts[1]!] as RelationshipPair
    }),
  )

  return pairSet
})

/**
 * Groups pairs by source entity and deduplicates target entities.
 * Produces a compressed output where each source appears once with all its unique targets.
 */
export const groupPairsBySource = Effect.fn('groupPairsBySource')(function* (
  pairs: ReadonlyArray<RelationshipPair>,
) {
  return pipe(
    pairs,
    Array.groupBy(([source]) => source),
    Record.mapEntries((edges, sourceEntityType) => [
      sourceEntityType,
      {
        sourceEntityType,
        targetEntityTypes: pipe(
          edges,
          Array.map(([, target]) => target),
          Array.dedupe,
        ),
      },
    ]),
    Record.values,
  ) satisfies GroupedRelationships
})

/**
 * Compresses duplicate pairs while preserving first-seen order.
 * Uses HashSet internally for efficient deduplication.
 */
export const compressPairs = Effect.fn('compressPairs')(function* (
  pairs: ReadonlyArray<RelationshipPair>,
) {
  type State = {
    readonly seen: HashSet.HashSet<string>
    readonly result: ReadonlyArray<RelationshipPair>
  }

  return pipe(
    pairs,
    Array.reduce(
      { result: [], seen: HashSet.empty<string>() } as State,
      (state, [source, target]) => {
        const key = `${source}|${target}`
        if (pipe(state.seen, HashSet.has(key))) {
          return state
        }
        return {
          result: [...state.result, [source, target] as RelationshipPair],
          seen: pipe(state.seen, HashSet.add(key)),
        }
      },
    ),
    (state) => state.result,
  )
})

/**
 * Compresses relationship inputs by combining duplicates.
 * Multiple inputs with the same source are merged into one with combined targets.
 */
export const compressRelationshipInputs = Effect.fn('compressRelationshipInputs')(function* (
  inputs: ReadonlyArray<RelationshipInput>,
) {
  return pipe(
    inputs,
    // Group by source entity type
    Array.groupBy((input) => input.sourceEntityTypeTag),
    // Merge all targets for each source
    Record.mapEntries((inputsForSource, sourceEntityTypeTag) => [
      sourceEntityTypeTag,
      {
        sourceEntityTypeTag,
        targetEntityTypeTags: pipe(
          inputsForSource,
          Array.flatMap((input) => input.targetEntityTypeTags),
          // Deduplicate targets
          Array.dedupe,
        ),
      },
    ]),
    Record.values,
  )
})
