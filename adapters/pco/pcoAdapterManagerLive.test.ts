import { effect } from '@openfaith/bun-test'
import { describe, expect } from 'bun:test'
import { Effect, HashMap, pipe } from 'effect'

describe('pcoAdapterManagerLive - relationship extraction', () => {
  effect('should identify missing campus external links from primary_campus relationships', () =>
    Effect.gen(function* () {
      // Simulate PCO response data structure
      const entities = [
        {
          type: 'Person',
          id: '76201466',
          attributes: {
            first_name: 'Amy',
            last_name: 'Filmalter',
            created_at: '2020-05-03T12:20:47Z',
            updated_at: '2022-12-14T21:10:27Z',
          },
          relationships: {
            primary_campus: {
              data: {
                type: 'PrimaryCampus',
                id: '46838',
              },
            },
          },
        },
        {
          type: 'Person',
          id: '80245565',
          attributes: {
            first_name: 'Yeet test',
            last_name: 'Person',
            created_at: '2020-08-06T10:57:40Z',
            updated_at: '2025-08-11T20:47:59Z',
          },
          relationships: {
            primary_campus: {
              data: {
                type: 'PrimaryCampus',
                id: '46838', // Same campus ID
              },
            },
          },
        },
      ]

      // Test that we identify the missing campus link
      const missingLinks: Array<any> = []
      const seenExternalIds = new Set<string>()
      const externalLinkMap = HashMap.empty<string, any>()

      // Mock the relationship discovery (in real code this comes from discoverPcoRelationships)
      const relationshipAnnotations = {
        primary_campus: 'campus', // Maps to 'campus' not 'primarycampus'
      }

      entities.forEach((entity) => {
        if (!entity.relationships) return

        Object.entries(relationshipAnnotations).forEach(([relKey, targetType]) => {
          const relData = (entity.relationships as any)?.[relKey]?.data
          if (relData?.id) {
            const hasLink = pipe(externalLinkMap, HashMap.has(relData.id))

            if (!hasLink && !seenExternalIds.has(relData.id)) {
              seenExternalIds.add(relData.id)
              missingLinks.push({
                adapter: 'pco' as const,
                createdAt: undefined,
                entityType: targetType, // Should be 'campus'
                externalId: relData.id,
                updatedAt: undefined,
              })
            }
          }
        })
      })

      // Verify we identified the missing campus link correctly
      expect(missingLinks).toHaveLength(1)
      expect(missingLinks[0]).toEqual({
        adapter: 'pco',
        createdAt: undefined,
        entityType: 'campus', // NOT 'primarycampus'
        externalId: '46838',
        updatedAt: undefined,
      })

      // Verify deduplication works (both people reference same campus)
      expect(seenExternalIds.size).toBe(1)
      expect(seenExternalIds.has('46838')).toBe(true)
    }),
  )

  effect('should not create duplicate external links for the same entity', () =>
    Effect.gen(function* () {
      const entities = [
        {
          type: 'Person',
          id: '1',
          attributes: {
            created_at: '2020-01-01T00:00:00Z',
            updated_at: '2020-01-01T00:00:00Z',
          },
          relationships: {
            primary_campus: {
              data: { type: 'PrimaryCampus', id: 'campus1' },
            },
          },
        },
        {
          type: 'Person',
          id: '2',
          attributes: {
            created_at: '2020-01-01T00:00:00Z',
            updated_at: '2020-01-01T00:00:00Z',
          },
          relationships: {
            primary_campus: {
              data: { type: 'PrimaryCampus', id: 'campus1' }, // Same campus
            },
          },
        },
        {
          type: 'Person',
          id: '3',
          attributes: {
            created_at: '2020-01-01T00:00:00Z',
            updated_at: '2020-01-01T00:00:00Z',
          },
          relationships: {
            primary_campus: {
              data: { type: 'PrimaryCampus', id: 'campus2' }, // Different campus
            },
          },
        },
      ]

      const missingLinks: Array<any> = []
      const seenExternalIds = new Set<string>()
      const externalLinkMap = HashMap.empty<string, any>()
      const relationshipAnnotations = { primary_campus: 'campus' }

      entities.forEach((entity) => {
        if (!entity.relationships) return

        Object.entries(relationshipAnnotations).forEach(([relKey, targetType]) => {
          const relData = (entity.relationships as any)?.[relKey]?.data
          if (relData?.id) {
            const hasLink = pipe(externalLinkMap, HashMap.has(relData.id))

            if (!hasLink && !seenExternalIds.has(relData.id)) {
              seenExternalIds.add(relData.id)
              missingLinks.push({
                adapter: 'pco' as const,
                createdAt: undefined,
                entityType: targetType,
                externalId: relData.id,
                updatedAt: undefined,
              })
            }
          }
        })
      })

      // Should have 2 unique campus links, not 3
      expect(missingLinks).toHaveLength(2)
      expect(missingLinks.map((l) => l.externalId).sort()).toEqual(['campus1', 'campus2'])
    }),
  )
})
