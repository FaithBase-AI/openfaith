import { describe, expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import type { Edge } from '@openfaith/db'
import {
  type EntityRelationships,
  generateRelationColumns,
  getRelatedEntityIds,
  getRelationshipType,
} from '@openfaith/ui/table/relationColumnGenerator'
import { Effect } from 'effect'

describe('getRelatedEntityIds', () => {
  effect('extracts IDs from source edges', () =>
    Effect.gen(function* () {
      const sourceEdges: Array<Edge> = [
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'person_has_group',
          sourceEntityId: 'person_123',
          sourceEntityTypeTag: 'person',
          targetEntityId: 'group_456',
          targetEntityTypeTag: 'group',
          updatedAt: null,
          updatedBy: null,
        },
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'person_has_group',
          sourceEntityId: 'person_123',
          sourceEntityTypeTag: 'person',
          targetEntityId: 'group_789',
          targetEntityTypeTag: 'group',
          updatedAt: null,
          updatedBy: null,
        },
      ]

      const relatedIds = getRelatedEntityIds('person_123', 'group', sourceEdges, [])

      expect(relatedIds).toEqual(['group_456', 'group_789'])
    }),
  )

  effect('extracts IDs from target edges', () =>
    Effect.gen(function* () {
      const targetEdges: Array<Edge> = [
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'group_has_person',
          sourceEntityId: 'group_456',
          sourceEntityTypeTag: 'group',
          targetEntityId: 'person_123',
          targetEntityTypeTag: 'person',
          updatedAt: null,
          updatedBy: null,
        },
      ]

      const relatedIds = getRelatedEntityIds('person_123', 'group', [], targetEdges)

      expect(relatedIds).toEqual(['group_456'])
    }),
  )

  effect('combines and dedupes IDs from both edge types', () =>
    Effect.gen(function* () {
      const sourceEdges: Array<Edge> = [
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'person_has_group',
          sourceEntityId: 'person_123',
          sourceEntityTypeTag: 'person',
          targetEntityId: 'group_456',
          targetEntityTypeTag: 'group',
          updatedAt: null,
          updatedBy: null,
        },
      ]

      const targetEdges: Array<Edge> = [
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'group_has_person',
          sourceEntityId: 'group_456',
          sourceEntityTypeTag: 'group',
          targetEntityId: 'person_123',
          targetEntityTypeTag: 'person',
          updatedAt: null,
          updatedBy: null,
        },
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'group_has_person',
          sourceEntityId: 'group_789',
          sourceEntityTypeTag: 'group',
          targetEntityId: 'person_123',
          targetEntityTypeTag: 'person',
          updatedAt: null,
          updatedBy: null,
        },
      ]

      const relatedIds = getRelatedEntityIds('person_123', 'group', sourceEdges, targetEdges)

      // Should have group_456 (from both), and group_789 (from target)
      expect(relatedIds).toEqual(['group_456', 'group_789'])
    }),
  )

  effect('filters by target entity type', () =>
    Effect.gen(function* () {
      const sourceEdges: Array<Edge> = [
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'person_has_group',
          sourceEntityId: 'person_123',
          sourceEntityTypeTag: 'person',
          targetEntityId: 'group_456',
          targetEntityTypeTag: 'group',
          updatedAt: null,
          updatedBy: null,
        },
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'person_has_address',
          sourceEntityId: 'person_123',
          sourceEntityTypeTag: 'person',
          targetEntityId: 'address_789',
          targetEntityTypeTag: 'address',
          updatedAt: null,
          updatedBy: null,
        },
      ]

      const groupIds = getRelatedEntityIds('person_123', 'group', sourceEdges, [])
      const addressIds = getRelatedEntityIds('person_123', 'address', sourceEdges, [])

      expect(groupIds).toEqual(['group_456'])
      expect(addressIds).toEqual(['address_789'])
    }),
  )

  effect('returns empty array when no edges match', () =>
    Effect.gen(function* () {
      const sourceEdges: Array<Edge> = [
        {
          _tag: 'edge',
          createdAt: new Date(),
          createdBy: null,
          deletedAt: null,
          deletedBy: null,
          metadata: {},
          orgId: 'org_1',
          relationshipType: 'person_has_group',
          sourceEntityId: 'person_123',
          sourceEntityTypeTag: 'person',
          targetEntityId: 'group_456',
          targetEntityTypeTag: 'group',
          updatedAt: null,
          updatedBy: null,
        },
      ]

      const relatedIds = getRelatedEntityIds('person_123', 'address', sourceEdges, [])

      expect(relatedIds).toEqual([])
    }),
  )

  effect('handles empty edge arrays', () =>
    Effect.gen(function* () {
      const relatedIds = getRelatedEntityIds('person_123', 'group', [], [])

      expect(relatedIds).toEqual([])
    }),
  )
})

describe('getRelationshipType', () => {
  effect('generates correct relationship type string', () =>
    Effect.gen(function* () {
      expect(getRelationshipType('person', 'group')).toBe('person_has_group')
      expect(getRelationshipType('Person', 'Group')).toBe('person_has_group')
      expect(getRelationshipType('group', 'person')).toBe('group_has_person')
      expect(getRelationshipType('address', 'person')).toBe('address_has_person')
    }),
  )
})

describe('generateRelationColumns', () => {
  effect('generates columns for each target entity type', () =>
    Effect.gen(function* () {
      const entityRelationships: Array<EntityRelationships> = [
        {
          sourceEntityType: 'person',
          targetEntityTypes: ['group', 'address'],
        },
      ]

      const columns = generateRelationColumns('person', entityRelationships)

      expect(columns.length).toBe(2)
      expect(columns[0]?.id).toBe('relation_group')
      expect(columns[1]?.id).toBe('relation_address')
    }),
  )

  effect('returns empty array when no relationships found', () =>
    Effect.gen(function* () {
      const entityRelationships: Array<EntityRelationships> = [
        {
          sourceEntityType: 'group',
          targetEntityTypes: ['person'],
        },
      ]

      const columns = generateRelationColumns('person', entityRelationships)

      expect(columns.length).toBe(0)
    }),
  )

  effect('returns empty array when entity relationships is empty', () =>
    Effect.gen(function* () {
      const columns = generateRelationColumns('person', [])

      expect(columns.length).toBe(0)
    }),
  )

  effect('column has correct properties', () =>
    Effect.gen(function* () {
      const entityRelationships: Array<EntityRelationships> = [
        {
          sourceEntityType: 'person',
          targetEntityTypes: ['group'],
        },
      ]

      const columns = generateRelationColumns('person', entityRelationships)
      const column = columns[0]

      expect(column).toBeDefined()
      expect(column?.id).toBe('relation_group')
      expect(column?.enableSorting).toBe(true)
      expect(column?.enableColumnFilter).toBe(true)
      expect(typeof column?.cell).toBe('function')
      expect(typeof column?.header).toBe('function')
      expect(typeof column?.filterFn).toBe('function')
      expect(typeof column?.sortingFn).toBe('function')
    }),
  )

  effect('filterFn filters by presence of relations', () =>
    Effect.gen(function* () {
      const entityRelationships: Array<EntityRelationships> = [
        {
          sourceEntityType: 'person',
          targetEntityTypes: ['group'],
        },
      ]

      const columns = generateRelationColumns('person', entityRelationships)
      const filterFn = columns[0]?.filterFn

      if (!filterFn || typeof filterFn !== 'function') {
        throw new Error('filterFn should be defined as a function')
      }

      const rowWithRelations = {
        original: {
          id: 'person_123',
          sourceEdges: [
            {
              _tag: 'edge' as const,
              createdAt: new Date(),
              createdBy: null,
              deletedAt: null,
              deletedBy: null,
              metadata: {},
              orgId: 'org_1',
              relationshipType: 'person_has_group',
              sourceEntityId: 'person_123',
              sourceEntityTypeTag: 'person',
              targetEntityId: 'group_456',
              targetEntityTypeTag: 'group',
              updatedAt: null,
              updatedBy: null,
            },
          ],
          targetEdges: [],
        },
      }

      const rowWithoutRelations = {
        original: {
          id: 'person_456',
          sourceEdges: [],
          targetEdges: [],
        },
      }

      // Test 'has' filter
      // filterFn signature: (row, columnId, filterValue, addMeta)
      expect(filterFn(rowWithRelations as any, 'relation_group', 'has', () => {})).toBe(true)
      expect(filterFn(rowWithoutRelations as any, 'relation_group', 'has', () => {})).toBe(false)

      // Test 'none' filter
      expect(filterFn(rowWithRelations as any, 'relation_group', 'none', () => {})).toBe(false)
      expect(filterFn(rowWithoutRelations as any, 'relation_group', 'none', () => {})).toBe(true)

      // Test no filter
      expect(filterFn(rowWithRelations as any, 'relation_group', null, () => {})).toBe(true)
      expect(filterFn(rowWithoutRelations as any, 'relation_group', null, () => {})).toBe(true)
    }),
  )

  effect('sortingFn sorts by count of relations', () =>
    Effect.gen(function* () {
      const entityRelationships: Array<EntityRelationships> = [
        {
          sourceEntityType: 'person',
          targetEntityTypes: ['group'],
        },
      ]

      const columns = generateRelationColumns('person', entityRelationships)
      const sortingFn = columns[0]?.sortingFn

      if (!sortingFn || typeof sortingFn !== 'function') {
        throw new Error('sortingFn should be defined as a function')
      }

      const rowWith2Relations = {
        original: {
          id: 'person_123',
          sourceEdges: [
            {
              _tag: 'edge' as const,
              createdAt: new Date(),
              createdBy: null,
              deletedAt: null,
              deletedBy: null,
              metadata: {},
              orgId: 'org_1',
              relationshipType: 'person_has_group',
              sourceEntityId: 'person_123',
              sourceEntityTypeTag: 'person',
              targetEntityId: 'group_456',
              targetEntityTypeTag: 'group',
              updatedAt: null,
              updatedBy: null,
            },
            {
              _tag: 'edge' as const,
              createdAt: new Date(),
              createdBy: null,
              deletedAt: null,
              deletedBy: null,
              metadata: {},
              orgId: 'org_1',
              relationshipType: 'person_has_group',
              sourceEntityId: 'person_123',
              sourceEntityTypeTag: 'person',
              targetEntityId: 'group_789',
              targetEntityTypeTag: 'group',
              updatedAt: null,
              updatedBy: null,
            },
          ],
          targetEdges: [],
        },
      }

      const rowWith1Relation = {
        original: {
          id: 'person_456',
          sourceEdges: [
            {
              _tag: 'edge' as const,
              createdAt: new Date(),
              createdBy: null,
              deletedAt: null,
              deletedBy: null,
              metadata: {},
              orgId: 'org_1',
              relationshipType: 'person_has_group',
              sourceEntityId: 'person_456',
              sourceEntityTypeTag: 'person',
              targetEntityId: 'group_111',
              targetEntityTypeTag: 'group',
              updatedAt: null,
              updatedBy: null,
            },
          ],
          targetEdges: [],
        },
      }

      const rowWith0Relations = {
        original: {
          id: 'person_789',
          sourceEdges: [],
          targetEdges: [],
        },
      }

      // sortingFn returns negative if A < B, positive if A > B, 0 if equal
      expect(
        sortingFn(rowWith0Relations as any, rowWith1Relation as any, 'relation_group'),
      ).toBeLessThan(0)
      expect(
        sortingFn(rowWith1Relation as any, rowWith2Relations as any, 'relation_group'),
      ).toBeLessThan(0)
      expect(
        sortingFn(rowWith2Relations as any, rowWith1Relation as any, 'relation_group'),
      ).toBeGreaterThan(0)
      expect(sortingFn(rowWith1Relation as any, rowWith1Relation as any, 'relation_group')).toBe(0)
    }),
  )
})
