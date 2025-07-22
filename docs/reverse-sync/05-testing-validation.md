# Testing & Validation Strategy for Reverse Sync

## Overview

This document outlines the comprehensive testing strategy for the reverse sync implementation. Given the critical nature of data synchronization between OpenFaith and external ChMS systems, we need thorough testing at every level to ensure reliability, data integrity, and performance.

## Context Files Required

Before implementing tests, review these files to understand the system:

### **Core Implementation Files**

- `docs/reverse-sync/01-external-link-manager.md` - ExternalLinkManager service
- `docs/reverse-sync/02-sync-orchestrator.md` - SyncOrchestrator service
- `docs/reverse-sync/03-auto-generated-mutators.md` - Auto-generated mutators

### **Existing Test Patterns**

- `packages/shared/schema.test.ts` - Schema testing patterns
- Look for existing test files in the codebase for patterns

### **Infrastructure for Testing**

- `adapters/pco/api/pcoApi.ts` - PCO API client (for integration tests)
- `packages/zero-effect/client.ts` - Zero Effect testing utilities
- `backend/server/live/` - Live service implementations

## Testing Architecture

### **Test Pyramid Structure**

```
                    E2E Tests
                   /          \
              Integration Tests
             /                  \
        Unit Tests          Contract Tests
       /         \              /        \
  Services    Schemas    API Mocks   Data Validation
```

## Unit Testing Strategy

### **1. ExternalLinkManager Tests**

**File**: `adapters/adapter-core/layers/__tests__/externalLinkManager.test.ts`

```typescript
import { ExternalLinkManager } from "@openfaith/adapter-core/layers/externalLinkManager";
import { Effect, Layer, TestContext } from "effect";

describe("ExternalLinkManager", () => {
  const mockExternalLinks = [
    {
      entityId: "person-123",
      entityType: "person",
      externalSystem: "pco",
      externalId: "pco-456",
      orgId: "org-789",
      userId: "user-101",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  const MockExternalLinkManager = Layer.succeed(
    ExternalLinkManager,
    ExternalLinkManager.of({
      getExternalLinksForEntity: (entityType, entityId) =>
        Effect.succeed(
          mockExternalLinks.filter(
            (link) =>
              link.entityType === entityType && link.entityId === entityId,
          ),
        ),

      findEntityByExternalId: (externalSystem, externalId) =>
        Effect.succeed(
          mockExternalLinks.find(
            (link) =>
              link.externalSystem === externalSystem &&
              link.externalId === externalId,
          ) || null,
        ),

      createExternalLink: (link) => Effect.succeed(void 0),
      updateExternalLink: (entityId, externalSystem, updates) =>
        Effect.succeed(void 0),
      deleteExternalLink: (entityId, externalSystem) => Effect.succeed(void 0),
      getExternalLinksForEntities: (entityType, entityIds) =>
        Effect.succeed({}),
      createExternalLinks: (links) => Effect.succeed(void 0),
    }),
  );

  it("should find external links for entity", async () => {
    const program = Effect.gen(function* () {
      const manager = yield* ExternalLinkManager;
      const links = yield* manager.getExternalLinksForEntity(
        "person",
        "person-123",
      );
      return links;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockExternalLinkManager)),
    );

    expect(result).toHaveLength(1);
    expect(result[0].externalSystem).toBe("pco");
    expect(result[0].externalId).toBe("pco-456");
  });

  it("should return empty array for non-existent entity", async () => {
    const program = Effect.gen(function* () {
      const manager = yield* ExternalLinkManager;
      const links = yield* manager.getExternalLinksForEntity(
        "person",
        "non-existent",
      );
      return links;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockExternalLinkManager)),
    );

    expect(result).toHaveLength(0);
  });

  it("should handle database errors gracefully", async () => {
    const ErrorExternalLinkManager = Layer.succeed(
      ExternalLinkManager,
      ExternalLinkManager.of({
        getExternalLinksForEntity: () =>
          Effect.fail(new Error("Database connection failed")),
        findEntityByExternalId: () =>
          Effect.fail(new Error("Database connection failed")),
        createExternalLink: () =>
          Effect.fail(new Error("Database connection failed")),
        updateExternalLink: () =>
          Effect.fail(new Error("Database connection failed")),
        deleteExternalLink: () =>
          Effect.fail(new Error("Database connection failed")),
        getExternalLinksForEntities: () =>
          Effect.fail(new Error("Database connection failed")),
        createExternalLinks: () =>
          Effect.fail(new Error("Database connection failed")),
      }),
    );

    const program = Effect.gen(function* () {
      const manager = yield* ExternalLinkManager;
      return yield* manager.getExternalLinksForEntity("person", "person-123");
    });

    await expect(
      Effect.runPromise(program.pipe(Effect.provide(ErrorExternalLinkManager))),
    ).rejects.toThrow("Database connection failed");
  });
});
```

### **2. SyncOrchestrator Tests**

**File**: `adapters/adapter-core/layers/__tests__/syncOrchestrator.test.ts`

```typescript
import {
  SyncOrchestrator,
  SyncValidationError,
} from "@openfaith/adapter-core/layers/syncOrchestrator";
import { ExternalLinkManager } from "@openfaith/adapter-core/layers/externalLinkManager";
import { Effect, Layer } from "effect";

describe("SyncOrchestrator", () => {
  const mockSyncResults = [
    {
      entityType: "person",
      entityId: "person-123",
      externalSystem: "pco",
      operation: "update" as const,
      success: true,
      timestamp: new Date(),
    },
  ];

  const MockSyncOrchestrator = Layer.succeed(
    SyncOrchestrator,
    SyncOrchestrator.of({
      pushToExternalSystems: (entityType, entityData, operation, options) =>
        Effect.succeed(mockSyncResults),

      syncToSpecificSystem: (entityType, entityData, targetSystem, operation) =>
        Effect.succeed(mockSyncResults[0]),

      bulkSync: (entities, options) => Effect.succeed(mockSyncResults),

      getAvailableAdapters: () => Effect.succeed(["pco"]),

      getAdapterCapabilities: (adapterName) =>
        Effect.succeed({
          supportedEntities: ["person"],
          supportedOperations: { person: ["create", "update", "delete"] },
        }),
    }),
  );

  it("should sync entity to external systems", async () => {
    const program = Effect.gen(function* () {
      const orchestrator = yield* SyncOrchestrator;
      const results = yield* orchestrator.pushToExternalSystems(
        "person",
        { id: "person-123", firstName: "John" },
        "update",
      );
      return results;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockSyncOrchestrator)),
    );

    expect(result).toHaveLength(1);
    expect(result[0].success).toBe(true);
    expect(result[0].externalSystem).toBe("pco");
  });

  it("should validate entity data", async () => {
    const program = Effect.gen(function* () {
      const orchestrator = yield* SyncOrchestrator;
      return yield* orchestrator.pushToExternalSystems(
        "person",
        null, // Invalid data
        "update",
      );
    });

    await expect(
      Effect.runPromise(program.pipe(Effect.provide(MockSyncOrchestrator))),
    ).rejects.toThrow();
  });

  it("should handle partial sync failures", async () => {
    const PartialFailureSyncOrchestrator = Layer.succeed(
      SyncOrchestrator,
      SyncOrchestrator.of({
        pushToExternalSystems: () =>
          Effect.succeed([
            { ...mockSyncResults[0], success: true },
            {
              ...mockSyncResults[0],
              externalSystem: "ccb",
              success: false,
              error: "API timeout",
            },
          ]),
        syncToSpecificSystem: () => Effect.succeed(mockSyncResults[0]),
        bulkSync: () => Effect.succeed([]),
        getAvailableAdapters: () => Effect.succeed(["pco", "ccb"]),
        getAdapterCapabilities: () =>
          Effect.succeed({
            supportedEntities: [],
            supportedOperations: {},
          }),
      }),
    );

    const program = Effect.gen(function* () {
      const orchestrator = yield* SyncOrchestrator;
      const results = yield* orchestrator.pushToExternalSystems(
        "person",
        { id: "person-123", firstName: "John" },
        "update",
      );
      return results;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(PartialFailureSyncOrchestrator)),
    );

    expect(result).toHaveLength(2);
    expect(result[0].success).toBe(true);
    expect(result[1].success).toBe(false);
    expect(result[1].error).toBe("API timeout");
  });
});
```

### **3. Auto-Generated Mutator Tests**

**File**: `packages/zero/services/__tests__/mutatorGenerator.test.ts`

```typescript
import { MutatorGenerator } from "@openfaith/zero/services/mutatorGenerator";
import { Effect, Layer } from "effect";

describe("MutatorGenerator", () => {
  const MockMutatorGenerator = Layer.succeed(
    MutatorGenerator,
    MutatorGenerator.of({
      generateAllMutators: (authData, customOverrides) =>
        Effect.succeed({
          people: {
            update: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        }),

      generateEntityMutators: (config, authData) =>
        Effect.succeed({
          update: jest.fn(),
          create: jest.fn(),
          delete: jest.fn(),
        }),

      discoverEntities: () =>
        Effect.succeed([
          {
            entityType: "person",
            pluralName: "people",
            inputSchemas: {
              update: expect.any(Object),
              create: expect.any(Object),
              delete: expect.any(Object),
            },
          },
        ]),
    }),
  );

  it("should discover entities with OfEntity annotations", async () => {
    const program = Effect.gen(function* () {
      const generator = yield* MutatorGenerator;
      return yield* generator.discoverEntities();
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockMutatorGenerator)),
    );

    expect(result).toContainEqual(
      expect.objectContaining({
        entityType: "person",
        pluralName: "people",
      }),
    );
  });

  it("should generate mutators for all discovered entities", async () => {
    const program = Effect.gen(function* () {
      const generator = yield* MutatorGenerator;
      return yield* generator.generateAllMutators({
        sub: "user-123",
        activeOrganizationId: "org-456",
      });
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockMutatorGenerator)),
    );

    expect(result.people).toBeDefined();
    expect(result.people.update).toBeDefined();
    expect(result.people.create).toBeDefined();
    expect(result.people.delete).toBeDefined();
  });

  it("should apply custom overrides", async () => {
    const customOverrides = {
      people: {
        update: jest.fn().mockName("customUpdate"),
      },
    };

    const program = Effect.gen(function* () {
      const generator = yield* MutatorGenerator;
      return yield* generator.generateAllMutators(
        { sub: "user-123", activeOrganizationId: "org-456" },
        customOverrides,
      );
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockMutatorGenerator)),
    );

    // Custom override should be applied
    expect(result.people.update).toBe(customOverrides.people.update);
  });
});
```

## Integration Testing Strategy

### **1. Database Integration Tests**

**File**: `backend/server/live/__tests__/externalLinkManagerLive.integration.test.ts`

```typescript
import { ExternalLinkManagerLive } from "@openfaith/backend/server/live/externalLinkManagerLive";
import { ExternalLinkManager } from "@openfaith/adapter-core/layers/externalLinkManager";
import { Effect, TestContext } from "effect";

describe("ExternalLinkManagerLive Integration", () => {
  let testDb: any; // Setup test database

  beforeEach(async () => {
    // Setup test database with clean state
    testDb = await setupTestDatabase();
  });

  afterEach(async () => {
    // Cleanup test database
    await cleanupTestDatabase(testDb);
  });

  it("should create and retrieve external links", async () => {
    const program = Effect.gen(function* () {
      const manager = yield* ExternalLinkManager;

      // Create external link
      yield* manager.createExternalLink({
        entityId: "person-123",
        entityType: "person",
        externalSystem: "pco",
        externalId: "pco-456",
        orgId: "org-789",
        userId: "user-101",
      });

      // Retrieve external links
      const links = yield* manager.getExternalLinksForEntity(
        "person",
        "person-123",
      );
      return links;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ExternalLinkManagerLive)),
    );

    expect(result).toHaveLength(1);
    expect(result[0].externalSystem).toBe("pco");
    expect(result[0].externalId).toBe("pco-456");
  });

  it("should handle concurrent operations", async () => {
    const programs = Array.from({ length: 10 }, (_, i) =>
      Effect.gen(function* () {
        const manager = yield* ExternalLinkManager;
        return yield* manager.createExternalLink({
          entityId: `person-${i}`,
          entityType: "person",
          externalSystem: "pco",
          externalId: `pco-${i}`,
          orgId: "org-789",
          userId: "user-101",
        });
      }),
    );

    await expect(
      Effect.runPromise(
        Effect.all(programs, { concurrency: "unbounded" }).pipe(
          Effect.provide(ExternalLinkManagerLive),
        ),
      ),
    ).resolves.not.toThrow();
  });
});
```

### **2. PCO API Integration Tests**

**File**: `adapters/pco/__tests__/pcoSync.integration.test.ts`

```typescript
import { SyncOrchestratorLive } from "@openfaith/backend/server/live/syncOrchestratorLive";
import { SyncOrchestrator } from "@openfaith/adapter-core/layers/syncOrchestrator";
import { PcoHttpClient } from "@openfaith/pco/server";
import { Effect } from "effect";

describe("PCO Sync Integration", () => {
  // Use PCO sandbox environment for testing
  const testConfig = {
    baseUrl: "https://api-sandbox.planningcenteronline.com",
    clientId: process.env.PCO_SANDBOX_CLIENT_ID,
    clientSecret: process.env.PCO_SANDBOX_CLIENT_SECRET,
  };

  beforeAll(() => {
    if (!testConfig.clientId || !testConfig.clientSecret) {
      throw new Error("PCO sandbox credentials not configured");
    }
  });

  it("should sync person update to PCO sandbox", async () => {
    const testPerson = {
      id: "test-person-123",
      firstName: "Integration",
      lastName: "Test",
      email: "integration.test@example.com",
    };

    const program = Effect.gen(function* () {
      const orchestrator = yield* SyncOrchestrator;

      // First create external link for this test person
      // (In real app, this would exist from initial sync)

      const results = yield* orchestrator.pushToExternalSystems(
        "person",
        testPerson,
        "update",
      );

      return results;
    });

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(SyncOrchestratorLive),
        Effect.provide(testPcoApiLayer),
      ),
    );

    expect(result).toHaveLength(1);
    expect(result[0].success).toBe(true);
    expect(result[0].externalSystem).toBe("pco");
  }, 30000); // Longer timeout for API calls

  it("should handle PCO API rate limits gracefully", async () => {
    // Create multiple rapid requests to test rate limiting
    const requests = Array.from({ length: 20 }, (_, i) => ({
      id: `test-person-${i}`,
      firstName: `Test${i}`,
      lastName: "RateLimit",
    }));

    const program = Effect.gen(function* () {
      const orchestrator = yield* SyncOrchestrator;

      const results = yield* Effect.forEach(
        requests,
        (person) =>
          orchestrator.pushToExternalSystems("person", person, "update"),
        { concurrency: 5 }, // Controlled concurrency
      );

      return results.flat();
    });

    const results = await Effect.runPromise(
      program.pipe(
        Effect.provide(SyncOrchestratorLive),
        Effect.provide(testPcoApiLayer),
      ),
    );

    // All requests should eventually succeed (with retries)
    const successCount = results.filter((r) => r.success).length;
    expect(successCount).toBeGreaterThan(15); // Allow for some failures
  }, 60000);
});
```

## End-to-End Testing Strategy

### **1. Full Sync Flow Tests**

**File**: `__tests__/e2e/reverseSync.e2e.test.ts`

```typescript
import { createClientMutators } from "@openfaith/zero/mutators";
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from "./helpers/testSetup";

describe("Reverse Sync E2E", () => {
  let testEnv: any;

  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment(testEnv);
  });

  it("should complete full sync flow: Zero mutation → External sync", async () => {
    const mutators = createClientMutators({
      sub: "test-user",
      activeOrganizationId: "test-org",
    });

    // 1. Create person locally
    const createdPerson = await mutators.people.create(testEnv.tx, {
      firstName: "E2E",
      lastName: "Test",
      email: "e2e.test@example.com",
    });

    // 2. Verify local creation
    expect(createdPerson.id).toBeDefined();
    expect(createdPerson.firstName).toBe("E2E");

    // 3. Verify external sync occurred
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for async sync

    const externalLinks = await testEnv.db.query.externalLinks.findMany({
      where: { entityId: createdPerson.id },
    });

    expect(externalLinks).toHaveLength(1);
    expect(externalLinks[0].externalSystem).toBe("pco");

    // 4. Update person
    await mutators.people.update(testEnv.tx, {
      id: createdPerson.id,
      firstName: "Updated E2E",
    });

    // 5. Verify update synced externally
    // (Would need to check PCO API directly in real test)

    // 6. Delete person
    await mutators.people.delete(testEnv.tx, {
      id: createdPerson.id,
    });

    // 7. Verify deletion synced
    const deletedLinks = await testEnv.db.query.externalLinks.findMany({
      where: { entityId: createdPerson.id },
    });

    expect(deletedLinks).toHaveLength(0);
  });
});
```

## Performance Testing Strategy

### **1. Load Testing**

**File**: `__tests__/performance/syncLoad.test.ts`

```typescript
describe("Sync Performance", () => {
  it("should handle bulk sync operations efficiently", async () => {
    const startTime = Date.now();

    const entities = Array.from({ length: 1000 }, (_, i) => ({
      entityType: "person",
      entityData: {
        id: `person-${i}`,
        firstName: `Person${i}`,
        lastName: "LoadTest",
      },
      operation: "update" as const,
    }));

    const program = Effect.gen(function* () {
      const orchestrator = yield* SyncOrchestrator;
      return yield* orchestrator.bulkSync(entities);
    });

    const results = await Effect.runPromise(
      program.pipe(Effect.provide(SyncOrchestratorLive)),
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(results).toHaveLength(1000);
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

    const successRate =
      results.filter((r) => r.success).length / results.length;
    expect(successRate).toBeGreaterThan(0.95); // 95% success rate
  });

  it("should respect rate limits without failures", async () => {
    // Test that rate limiting prevents API failures
    const rapidRequests = Array.from({ length: 100 }, (_, i) => ({
      id: `person-${i}`,
      firstName: `Rapid${i}`,
    }));

    const program = Effect.gen(function* () {
      const orchestrator = yield* SyncOrchestrator;

      return yield* Effect.forEach(
        rapidRequests,
        (person) =>
          orchestrator.pushToExternalSystems("person", person, "update"),
        { concurrency: "unbounded" },
      );
    });

    const results = await Effect.runPromise(
      program.pipe(Effect.provide(SyncOrchestratorLive)),
    );

    // Should not have any rate limit errors
    const rateLimitErrors = results
      .flat()
      .filter((r) => !r.success && r.error?.includes("rate limit"));

    expect(rateLimitErrors).toHaveLength(0);
  });
});
```

## Error Scenario Testing

### **1. Network Failure Tests**

```typescript
describe("Network Failure Scenarios", () => {
  it("should handle temporary network failures with retries", async () => {
    // Mock network failure that recovers after 2 attempts
    let attemptCount = 0;
    const mockFailingClient = {
      Person: {
        update: jest.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error("Network timeout");
          }
          return Promise.resolve({ success: true });
        }),
      },
    };

    // Test that sync eventually succeeds with retries
    const result = await testSyncWithMockClient(mockFailingClient);

    expect(result.success).toBe(true);
    expect(attemptCount).toBe(3);
  });

  it("should fail gracefully after max retries", async () => {
    const mockFailingClient = {
      Person: {
        update: jest.fn().mockRejectedValue(new Error("Permanent failure")),
      },
    };

    const result = await testSyncWithMockClient(mockFailingClient);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Permanent failure");
  });
});
```

## Test Data Management

### **1. Test Data Factory**

**File**: `__tests__/helpers/testDataFactory.ts`

```typescript
export const TestDataFactory = {
  person: (overrides = {}) => ({
    id: `person-${Math.random().toString(36).substr(2, 9)}`,
    firstName: "Test",
    lastName: "Person",
    email: "test@example.com",
    status: "active",
    ...overrides,
  }),

  externalLink: (overrides = {}) => ({
    entityId: `entity-${Math.random().toString(36).substr(2, 9)}`,
    entityType: "person",
    externalSystem: "pco",
    externalId: `pco-${Math.random().toString(36).substr(2, 9)}`,
    orgId: "test-org",
    userId: "test-user",
    ...overrides,
  }),

  authData: (overrides = {}) => ({
    sub: "test-user",
    activeOrganizationId: "test-org",
    ...overrides,
  }),
};
```

## Continuous Integration Setup

### **1. Test Pipeline Configuration**

```yaml
# .github/workflows/reverse-sync-tests.yml
name: Reverse Sync Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit:reverse-sync

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration:reverse-sync
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          PCO_SANDBOX_CLIENT_ID: ${{ secrets.PCO_SANDBOX_CLIENT_ID }}
          PCO_SANDBOX_CLIENT_SECRET: ${{ secrets.PCO_SANDBOX_CLIENT_SECRET }}

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e:reverse-sync
        env:
          PCO_SANDBOX_CLIENT_ID: ${{ secrets.PCO_SANDBOX_CLIENT_ID }}
          PCO_SANDBOX_CLIENT_SECRET: ${{ secrets.PCO_SANDBOX_CLIENT_SECRET }}
```

## Test Coverage Requirements

- **Unit Tests**: 90%+ coverage for all service methods
- **Integration Tests**: Cover all database operations and API integrations
- **E2E Tests**: Cover complete user workflows
- **Error Scenarios**: Test all identified failure modes
- **Performance Tests**: Validate performance requirements

## Monitoring and Observability in Tests

### **1. Test Metrics Collection**

```typescript
describe("Sync Metrics", () => {
  it("should collect sync performance metrics", async () => {
    const metricsCollector = new TestMetricsCollector();

    const result = await runSyncWithMetrics(metricsCollector);

    expect(metricsCollector.getMetric("sync_duration_ms")).toBeLessThan(5000);
    expect(metricsCollector.getMetric("sync_success_rate")).toBeGreaterThan(
      0.95,
    );
    expect(metricsCollector.getMetric("external_api_calls")).toBeGreaterThan(0);
  });
});
```

This comprehensive testing strategy ensures that the reverse sync implementation is reliable, performant, and maintainable while providing confidence in the critical data synchronization functionality.
