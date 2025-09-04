import { expect } from 'bun:test'
import { processMutation } from '@openfaith/adapter-core/chains/syncEngine.chain'
import { AdapterManager, InternalManager, TokenKey } from '@openfaith/adapter-core/server'
import { effect } from '@openfaith/bun-test'
import type { CRUDOp } from '@openfaith/domain'
import { Effect, Layer, Option } from 'effect'

// Mock implementations for testing
const MockAdapterManager = Layer.succeed(
  AdapterManager,
  AdapterManager.of({
    adapter: 'test',
    createEntity: () => Effect.succeed(undefined),
    deleteEntity: () => Effect.succeed(undefined),
    getEntityManifest: () => ({}),
    getEntityTypeForWebhookEvent: () => Effect.succeed('Person'),
    syncEntityId: () => Effect.succeed(undefined),
    syncEntityType: () => Effect.succeed(undefined),
    updateEntity: () => Effect.succeed(undefined),
  }),
)

const MockInternalManager = Layer.succeed(
  InternalManager,
  InternalManager.of({
    detectAndMarkDeleted: () => Effect.succeed([]),
    getExternalLink: () => Effect.succeed(Option.none()),
    processEntities: () => Effect.succeed(undefined),
    processExternalLinks: () =>
      Effect.succeed({
        allExternalLinks: [],
        changedExternalLinks: [],
      }),
    processRelationships: () => Effect.succeed(undefined),
  }),
)

const TestTokenKey = Layer.succeed(TokenKey, 'test_org')

const TestLayer = Layer.mergeAll(MockAdapterManager, MockInternalManager, TestTokenKey)

// Integration tests for the new sync chain
effect('processMutation chain function integrates correctly', () =>
  Effect.gen(function* () {
    const testOp: CRUDOp = {
      op: 'insert',
      primaryKey: { id: 'person_123' },
      source: 'test',
      tableName: 'people',
      value: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    }

    // This should execute without errors when properly wired
    yield* processMutation(testOp).pipe(Effect.provide(TestLayer))

    // If we get here, the chain executed successfully
    expect(true).toBe(true)
  }),
)

effect('processMutation handles update operations', () =>
  Effect.gen(function* () {
    const testOp: CRUDOp = {
      op: 'update',
      primaryKey: { id: 'group_456' },
      source: 'test',
      tableName: 'groups',
      value: {
        description: 'New description',
        name: 'Updated Group',
      },
    }

    yield* processMutation(testOp).pipe(Effect.provide(TestLayer))
    expect(true).toBe(true)
  }),
)

effect('processMutation handles delete operations', () =>
  Effect.gen(function* () {
    const testOp: CRUDOp = {
      op: 'delete',
      primaryKey: { id: 'addr_789' },
      source: 'test',
      tableName: 'addresses',
      value: {},
    }

    yield* processMutation(testOp).pipe(Effect.provide(TestLayer))
    expect(true).toBe(true)
  }),
)
