import { describe, expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { EntityBadges, EntityIdBadges } from '@openfaith/ui/components/badges/entityBadges'
import { Effect } from 'effect'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

describe('EntityBadges', () => {
  effect('renders entity badges with correct display names', () =>
    Effect.gen(function* () {
      const entities = [
        { _tag: 'person', firstName: 'John', id: '1', lastName: 'Doe' },
        { _tag: 'group', id: '2', name: 'Youth Group' },
        { _tag: 'person', firstName: 'Jane', id: '3', lastName: 'Smith' },
      ]

      const element = createElement(EntityBadges, {
        emptyText: 'No entities',
        entities,
        showAvatar: false,
      })

      const html = renderToString(element)

      // Check that names are displayed correctly
      expect(html).toContain('John Doe')
      expect(html).toContain('Youth Group')
      expect(html).toContain('Jane Smith')
    }),
  )

  effect('shows hidden count when specified', () =>
    Effect.gen(function* () {
      const entities = [
        { _tag: 'person', firstName: 'John', id: '1', lastName: 'Doe' },
        { _tag: 'group', id: '2', name: 'Youth Group' },
        { _tag: 'person', firstName: 'Jane', id: '3', lastName: 'Smith' },
        { _tag: 'person', firstName: 'Bob', id: '4', lastName: 'Johnson' },
        { _tag: 'person', firstName: 'Alice', id: '5', lastName: 'Williams' },
      ]

      const element = createElement(EntityBadges, {
        emptyText: 'No entities',
        entities,
        hiddenCount: 2,
        showAvatar: false,
      })

      const html = renderToString(element)

      // Should show "+2 more" text
      expect(html).toContain('+2 more')
      // Should show first 3 names
      expect(html).toContain('John Doe')
      expect(html).toContain('Youth Group')
      expect(html).toContain('Jane Smith')
      // Should not show last 2 names
      expect(html).not.toContain('Bob Johnson')
      expect(html).not.toContain('Alice Williams')
    }),
  )

  effect('shows empty text when no entities', () =>
    Effect.gen(function* () {
      const element = createElement(EntityBadges, {
        emptyText: 'No people',
        entities: [],
        showAvatar: false,
      })

      const html = renderToString(element)
      expect(html).toContain('No people')
    }),
  )

  effect('highlights specified entities', () =>
    Effect.gen(function* () {
      const entities = [
        { _tag: 'person', firstName: 'John', id: '1', lastName: 'Doe' },
        { _tag: 'person', firstName: 'Jane', id: '2', lastName: 'Smith' },
      ]

      const element = createElement(EntityBadges, {
        emptyText: 'No entities',
        entities,
        highlightIds: ['1'],
        showAvatar: false,
      })

      const html = renderToString(element)

      // Should contain shadow class for highlighted badge
      expect(html).toContain('shadow')
      expect(html).toContain('John Doe')
      expect(html).toContain('Jane Smith')
    }),
  )
})

describe('EntityIdBadges', () => {
  // Note: EntityIdBadge requires Zero context which is not available in tests
  // In production, it will fetch and display the actual entity data
  // This test is commented out as it requires Zero context
  // effect('renders entity ID badges with correct entity type', () =>
  //   Effect.gen(function* () {
  //     const entityIds = ['1', '2', '3']

  //     const element = createElement(EntityIdBadges, {
  //       entityIds,
  //       entityType: 'person',
  //       showAvatar: false,
  //     })

  //     const html = renderToString(element)

  //     // Should render something (either badges or loading states)
  //     expect(html.length).toBeGreaterThan(0)
  //   }),
  // )

  effect('shows correct empty text based on entity type', () =>
    Effect.gen(function* () {
      const element = createElement(EntityIdBadges, {
        entityIds: [],
        entityType: 'person',
        showAvatar: false,
      })

      const html = renderToString(element)

      // Should pluralize the entity type
      expect(html).toContain('No people')
    }),
  )
})
