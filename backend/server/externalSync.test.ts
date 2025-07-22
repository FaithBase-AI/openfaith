import { describe, expect, test } from 'bun:test'
import { ExternalLinkManager } from '@openfaith/adapter-core/layers/externalLinkManager'
import type { PushRequest } from '@openfaith/domain/Http'
import {
  MockPcoHttpClientLive,
  MockPcoHttpClientWithErrorsLive,
} from '@openfaith/pco/api/pcoApiMock'
import { externalSyncFunction } from '@openfaith/server/externalSync'
import { Effect, Layer } from 'effect'

// Mock ExternalLinkManager factory
const makeMockExternalLinkManager = (
  options: { hasExternalLinks?: boolean; trackSyncLifecycle?: boolean } = {},
) =>
  Effect.gen(function* () {
    let syncInProgressCalled = false
    let syncCompletedCalled = false

    const mockExternalLink = {
      _tag: 'externalLink' as const,
      adapter: 'pco',
      createdAt: new Date(),
      deletedAt: null,
      deletedBy: null,
      entityId: 'per_123',
      entityType: 'person',
      externalId: 'pco_123',
      lastProcessedAt: new Date(),
      orgId: 'org_123',
      syncing: false,
      updatedAt: new Date(),
      updatedBy: null,
    }

    return {
      createExternalLink: () => Effect.succeed(undefined),
      createExternalLinks: () => Effect.succeed(undefined),
      deleteExternalLink: () => Effect.succeed(undefined),
      findEntityByExternalId: () => Effect.succeed(null),
      getExternalLinksForEntities: () => Effect.succeed({}),
      getExternalLinksForEntity: () =>
        Effect.succeed(options.hasExternalLinks ? [mockExternalLink] : []),
      // Expose tracking state for tests
      getSyncTrackingState: () => Effect.succeed({ syncCompletedCalled, syncInProgressCalled }),
      markMultipleSyncCompleted: () => Effect.succeed(undefined),
      markMultipleSyncInProgress: () => Effect.succeed(undefined),
      markSyncCompleted: () =>
        Effect.sync(() => {
          if (options.trackSyncLifecycle) syncCompletedCalled = true
        }),
      markSyncInProgress: () =>
        Effect.sync(() => {
          if (options.trackSyncLifecycle) syncInProgressCalled = true
        }),
      updateExternalLink: () => Effect.succeed(undefined),
    }
  })

// Test data helpers
const createCrudOperation = (
  op: 'insert' | 'update' | 'upsert' | 'delete',
  tableName = 'people',
  entityId = 'per_123',
  value: any = { firstName: 'John', lastName: 'Doe' },
) => ({
  op,
  primaryKey: { id: entityId },
  tableName,
  value,
})

const createCrudMutation = (operations: Array<any>): PushRequest['mutations'][0] => ({
  args: [{ ops: operations }],
  clientID: 'test-client',
  id: 1,
  name: '_zero_crud',
  timestamp: Date.now(),
  type: 'crud' as const,
})

const createCustomMutation = (): PushRequest['mutations'][0] => ({
  args: [],
  clientID: 'test-client',
  id: 2,
  name: 'customMutation',
  timestamp: Date.now(),
  type: 'custom' as const,
})

describe('External Sync Functions', () => {
  describe('Integration Tests', () => {
    describe('externalSyncFunction', () => {
      test('processes empty mutations array', async () => {
        const mockExternalLinkManagerLayer = Layer.effect(
          ExternalLinkManager,
          makeMockExternalLinkManager(),
        )

        const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

        const result = await Effect.runPromise(
          externalSyncFunction([]).pipe(Effect.provide(testLayer)),
        )

        expect(result).toBeUndefined()
      })

      test('skips non-CRUD mutations', async () => {
        const mockExternalLinkManagerLayer = Layer.effect(
          ExternalLinkManager,
          makeMockExternalLinkManager(),
        )

        const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

        const mutations = [createCustomMutation()]

        const result = await Effect.runPromise(
          externalSyncFunction(mutations).pipe(Effect.provide(testLayer)),
        )

        expect(result).toBeUndefined()
      })

      test('processes CRUD mutation with no external links', async () => {
        const mockExternalLinkManagerLayer = Layer.effect(
          ExternalLinkManager,
          makeMockExternalLinkManager({ hasExternalLinks: false }),
        )

        const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

        const operation = createCrudOperation('insert', 'people')
        const mutation = createCrudMutation([operation])

        const result = await Effect.runPromise(
          externalSyncFunction([mutation]).pipe(Effect.provide(testLayer)),
        )

        expect(result).toBeUndefined()
      })

      test('processes CRUD mutation with external links successfully', async () => {
        const mockExternalLinkManagerLayer = Layer.effect(
          ExternalLinkManager,
          makeMockExternalLinkManager({
            hasExternalLinks: true,
            trackSyncLifecycle: true,
          }),
        )

        const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

        // Use 'addresses' table which should convert to 'Address' entity
        const operation = createCrudOperation('insert', 'addresses')
        const mutation = createCrudMutation([operation])

        const result = await Effect.runPromise(
          externalSyncFunction([mutation]).pipe(Effect.provide(testLayer)),
        )

        expect(result).toBeUndefined()
      })

      test('handles multiple operations in single mutation', async () => {
        const mockExternalLinkManagerLayer = Layer.effect(
          ExternalLinkManager,
          makeMockExternalLinkManager({ hasExternalLinks: true }),
        )

        const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

        const operations = [
          createCrudOperation('insert', 'people', 'per_123'),
          createCrudOperation('update', 'people', 'per_456'),
          createCrudOperation('delete', 'people', 'per_789'),
        ]
        const mutation = createCrudMutation(operations)

        const result = await Effect.runPromise(
          externalSyncFunction([mutation]).pipe(Effect.provide(testLayer)),
        )

        expect(result).toBeUndefined()
      })

      test('handles entity not found in manifest', async () => {
        const mockExternalLinkManagerLayer = Layer.effect(
          ExternalLinkManager,
          makeMockExternalLinkManager({ hasExternalLinks: true }),
        )

        const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

        // Use a table name that won't be found in the manifest
        const operation = createCrudOperation('insert', 'nonexistent_entities')
        const mutation = createCrudMutation([operation])

        const result = await Effect.runPromise(
          externalSyncFunction([mutation]).pipe(Effect.provide(testLayer)),
        )

        expect(result).toBeUndefined()
      })
    })
  })

  describe('Error Handling', () => {
    test('handles PCO client errors gracefully', async () => {
      const mockExternalLinkManagerLayer = Layer.effect(
        ExternalLinkManager,
        makeMockExternalLinkManager({ hasExternalLinks: true }),
      )

      const testLayer = Layer.mergeAll(
        mockExternalLinkManagerLayer,
        MockPcoHttpClientWithErrorsLive,
      )

      const operation = createCrudOperation('insert', 'people')
      const mutation = createCrudMutation([operation])

      // Should handle the error gracefully and not throw
      const result = await Effect.runPromise(
        externalSyncFunction([mutation]).pipe(Effect.provide(testLayer)),
      )

      expect(result).toBeUndefined()
    })

    test('handles unsupported adapters', async () => {
      const makeMockExternalLinkManagerWithUnsupportedAdapter = Effect.gen(function* () {
        const unsupportedExternalLink = {
          _tag: 'externalLink' as const,
          adapter: 'unsupported',
          createdAt: new Date(),
          deletedAt: null,
          deletedBy: null,
          entityId: 'per_123',
          entityType: 'person',
          externalId: 'pco_123',
          lastProcessedAt: new Date(),
          orgId: 'org_123',
          syncing: false,
          updatedAt: new Date(),
          updatedBy: null,
        }

        return {
          createExternalLink: () => Effect.succeed(undefined),
          createExternalLinks: () => Effect.succeed(undefined),
          deleteExternalLink: () => Effect.succeed(undefined),
          findEntityByExternalId: () => Effect.succeed(null),
          getExternalLinksForEntities: () => Effect.succeed({}),
          getExternalLinksForEntity: () => Effect.succeed([unsupportedExternalLink]),
          markMultipleSyncCompleted: () => Effect.succeed(undefined),
          markMultipleSyncInProgress: () => Effect.succeed(undefined),
          markSyncCompleted: () => Effect.succeed(undefined),
          markSyncInProgress: () => Effect.succeed(undefined),
          updateExternalLink: () => Effect.succeed(undefined),
        }
      })

      const mockExternalLinkManagerLayer = Layer.effect(
        ExternalLinkManager,
        makeMockExternalLinkManagerWithUnsupportedAdapter,
      )

      const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

      const operation = createCrudOperation('insert', 'people')
      const mutation = createCrudMutation([operation])

      const result = await Effect.runPromise(
        externalSyncFunction([mutation]).pipe(Effect.provide(testLayer)),
      )

      expect(result).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    test('handles operations with different CRUD types', async () => {
      const mockExternalLinkManagerLayer = Layer.effect(
        ExternalLinkManager,
        makeMockExternalLinkManager({ hasExternalLinks: true }),
      )

      const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

      // Test all CRUD operations
      const operations = [
        createCrudOperation('insert', 'people', 'per_1'),
        createCrudOperation('update', 'people', 'per_2'),
        createCrudOperation('upsert', 'people', 'per_3'),
        createCrudOperation('delete', 'people', 'per_4'),
      ]
      const mutation = createCrudMutation(operations)

      const result = await Effect.runPromise(
        externalSyncFunction([mutation]).pipe(Effect.provide(testLayer)),
      )

      expect(result).toBeUndefined()
    })

    test('handles malformed mutation gracefully', async () => {
      const mockExternalLinkManagerLayer = Layer.effect(
        ExternalLinkManager,
        makeMockExternalLinkManager(),
      )

      const testLayer = Layer.mergeAll(mockExternalLinkManagerLayer, MockPcoHttpClientLive)

      const malformedMutation = {
        ...createCrudMutation([]),
        args: [], // Missing the expected structure
      } as any

      // Should handle gracefully
      await expect(
        Effect.runPromise(
          externalSyncFunction([malformedMutation]).pipe(Effect.provide(testLayer)),
        ),
      ).rejects.toThrow()
    })
  })
})
