# 08: Implementing a New Sync (Planned)

**⚠️ Note: This document describes planned functionality for the future Sync Engine. The generic workflow factory and sync orchestration system are not yet implemented.**

Our planned Sync Engine will be built around a powerful **generic workflow factory**. This means you will not need to write a new, boilerplate-heavy workflow for every entity you want to sync. Instead, you will simply define the API endpoint, implement a data transformer, and the engine will handle the rest.

This guide will walk through the planned process for adding a new sync process for **Planning Center "Donations"**.

## Prerequisites (Planned)

Before you begin, you will need to ensure you have:
1.  Defined the `PCODonation` (API-specific) and `BaseDonation` (canonical) schemas in the API Adapter library.
2.  Read `04-defining-endpoints.md` to understand how to configure an endpoint with the current `pcoApiAdapter()` function.

---

### Step 1: Define the API Endpoint (Current Implementation Available)

This is the step you can do today. You must describe the API endpoint for fetching the new entity. This is done in the API Adapter library (`@openfaith/pco`).

In a file like `adapters/pco/modules/giving/pcoDonationEndpoints.ts`, add your new definition:

```typescript
import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoDonation } from '@openfaith/pco/modules/giving/pcoDonationSchema' // You would create this

export const getAllDonationsDefinition = pcoApiAdapter({
  apiSchema: PcoDonation,
  entity: 'Donation',
  method: 'GET',
  module: 'giving',
  name: 'getAll',
  path: '/giving/v2/donations',
  isCollection: true,
  
  // Define capabilities based on PCO's API documentation
  includes: ['person', 'payment_source'],
  orderableBy: ['created_at'],
  queryableBy: {
    fields: ['created_at', 'updated_at'],
    special: ['search']
  },
} as const)
```

Make sure this new definition is exported from your endpoints index file and added to your HttpApiGroup.

### Step 2: Implement the Data Transformer (Planned - Not Yet Available)

🚧 **This step is planned but not yet implemented.** The generic workflow will need to know how to convert the `BaseDonation` model into the model required by our application's database. This logic will be added to our planned `TransformerService`.

In the future Sync Engine project, you will navigate to something like `src/services/transformer.ts` and add a case for the new entity.

```typescript
// This is planned functionality - not yet implemented
// src/services/transformer.ts

// A map of entity names to their transformation functions
const transformerMap = {
  'Person': transformPerson,
  'Group': transformGroup,
  'Donation': transformDonation, // Add the new one here
};

function transformDonation(data: ReadonlyArray<BaseDonation>): ReadonlyArray<DbDonation> {
  // Your business logic to map fields will go here.
  return data.map(donation => ({
    id: donation.id,
    amount_in_cents: donation.amountCents,
    donor_id: donation.relationships.person.id,
    created_on: new Date(donation.createdAt),
  }));
}

// The live implementation of our service will use this map.
export const TransformerServiceLive = Layer.succeed(
  TransformerService,
  {
    transform: (entityName, data) => Effect.succeed(transformerMap[entityName](data))
  }
);
```

### Step 3: That's It! (Planned - Not Yet Available)

🚧 **This automation is planned but not yet implemented.**

**You will not need to write a new workflow or manually register it.**

The planned Sync Engine's main application entry point will be configured to:
1.  Import all endpoint definitions from the `@openfaith/pco` package.
2.  Iterate through them and use the `createSyncWorkflow` factory to generate a durable workflow *for each one*.
3.  Automatically merge all these generated workflow layers together.

By simply defining the endpoint and providing a transformer, the new "Donations" sync will be fully integrated, durable, scalable, and ready to be scheduled by the master sync orchestrator.

## Current Implementation Status

### What You Can Do Today:
- ✅ **Define Endpoint**: Create the endpoint definition using `pcoApiAdapter()`
- ✅ **Add to HttpApiGroup**: Include the endpoint in your API definition
- ✅ **Test API Integration**: Use the HttpApiClient to manually test the endpoint
- ✅ **Create Schemas**: Define the PCO and canonical data models

### What's Coming (Planned):
- 🚧 **Generic Workflow Factory**: Automatic workflow generation from endpoint definitions
- 🚧 **TransformerService**: Data transformation pipeline from API to database models
- 🚧 **Sync Orchestration**: Automatic scheduling and execution of sync jobs
- 🚧 **Dependency Management**: Handling entity relationships and sync order
- 🚧 **Progress Tracking**: Monitoring and resuming sync operations
- 🚧 **Error Handling**: Retry logic and failure recovery

## Manual Implementation (Current Workaround)

Until the Sync Engine is implemented, you can manually create basic sync functionality:

```typescript
// Current workaround - manual sync implementation
import { Effect } from 'effect'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { db } from '@openfaith/db' // Your database layer

const syncDonationsManually = Effect.gen(function* () {
  const client = yield* PcoHttpClient
  
  // Fetch donations from PCO
  const donationsResponse = yield* client.giving.getAll({})
  
  // Transform the data (manual transformation)
  const transformedDonations = donationsResponse.data.map(donation => ({
    id: donation.id,
    amount_in_cents: donation.attributes.amount_cents,
    donor_id: donation.relationships.person?.data?.id,
    created_on: new Date(donation.attributes.created_at),
    // ... other field mappings
  }))
  
  // Save to database
  yield* db.insertDonations(transformedDonations)
  
  console.log(`Synced ${transformedDonations.length} donations`)
})

// Run the manual sync
Effect.runPromise(syncDonationsManually.pipe(
  Effect.provide(/* your services layer */)
))
```

## Roadmap to Automatic Sync

The plan is to evolve from this manual approach to the automatic system:

### Phase 1: Basic Workflow Engine
1. Implement `@effect/workflow` and `@effect/cluster`
2. Create basic sync workflow templates
3. Add manual workflow triggering

### Phase 2: Generic Factory
1. Build the workflow factory that reads endpoint definitions
2. Implement the TransformerService pattern
3. Create automatic workflow registration

### Phase 3: Full Orchestration
1. Add dependency-aware scheduling
2. Implement multiple sync strategies (full, delta, reconciliation)
3. Build monitoring and management tools

The current endpoint definitions you create today will be the foundation that powers this future automation, ensuring your work won't be wasted when the full sync engine is implemented.