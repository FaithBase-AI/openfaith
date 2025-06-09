# 08: Implementing a New Sync

Our Sync Engine is built around a powerful **generic workflow factory**. This means you do not need to write a new, boilerplate-heavy workflow for every entity you want to sync. Instead, you simply define the API endpoint, implement a data transformer, and the engine handles the rest.

This guide will walk you through adding a new sync process for **Planning Center "Donations"**.

## Prerequisites

Before you begin, ensure you have already:
1.  Defined the `PCODonation` (API-specific) and `BaseDonation` (canonical) schemas in the API Client library.
2.  Read `04-defining-endpoints.md` to understand how to configure an endpoint.

---

### Step 1: Define the API Endpoint

This is the primary step. You must describe the API endpoint for fetching the new entity. This is done in the API Client library (`@your-org/pco-client`).

In a file like `src/pco/endpoints/donations.ts`, add your new definition:

```typescript
import { defineEndpoint } from '@your-org/api-client';
import { PCODonation, BaseDonation } from '../schemas';

export const getAllDonations = defineEndpoint({
  module: 'giving',
  name: 'donations.getAll',
  method: 'GET',
  path: '/giving/v2/donations',
  
  apiSchema: PCODonation,
  canonicalSchema: BaseDonation,
  
  // Define capabilities based on PCO's API documentation
  includes: ['person', 'payment_source'],
  orderableBy: ['created_at'],
  supportsWebhooks: false,
  deltaSyncField: 'updated_at',
});
```
Make sure this new definition is exported from your main `endpoints` index file.

### Step 2: Implement the Data Transformer

The generic workflow needs to know how to convert the `BaseDonation` model into the model required by our application's database. This logic is added to our `TransformerService`.

In the Sync Engine project, navigate to `src/services/transformer.ts` (or equivalent) and add a case for the new entity.

```typescript
// src/services/transformer.ts

// A map of entity names to their transformation functions
const transformerMap = {
  'Person': transformPerson,
  'Group': transformGroup,
  'Donation': transformDonation, // Add the new one here
};

function transformDonation(data: ReadonlyArray<BaseDonation>): ReadonlyArray<DbDonation> {
  // Your business logic to map fields goes here.
  return data.map(donation => ({
    id: donation.id,
    amount_in_cents: donation.amountCents,
    donor_id: donation.relationships.person.id,
    created_on: new Date(donation.createdAt),
  }));
}

// The live implementation of our service uses this map.
export const TransformerServiceLive = Layer.succeed(
  TransformerService,
  {
    transform: (entityName, data) => Effect.succeed(transformerMap[entityName](data))
  }
);
```

### Step 3: That's It!

**You do not need to write a new workflow or manually register it.**

The Sync Engine's main application entry point is already configured to:
1.  Import all endpoint definitions from the `@your-org/pco-client` package.
2.  Iterate through them and use the `createSyncWorkflow` factory to generate a durable workflow *for each one*.
3.  Automatically merge all these generated workflow layers together.

By simply defining the endpoint and providing a transformer, the new "Donations" sync is now fully integrated, durable, scalable, and ready to be scheduled by the master sync orchestrator.