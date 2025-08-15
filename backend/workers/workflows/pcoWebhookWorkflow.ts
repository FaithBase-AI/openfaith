import { Workflow } from '@effect/workflow'
import type { CRUDMutation } from '@openfaith/domain'
import { ExternalPushEntityWorkflow } from '@openfaith/workers/workflows/externalPushEntityWorkflow'
import { Array, Effect, Option, pipe, Schema, String } from 'effect'
import { nanoid } from 'nanoid'

const PcoWebhookData = Schema.Struct({
  attributes: Schema.Struct({
    name: Schema.String,
    payload: Schema.String,
  }),
  id: Schema.String,
  relationships: Schema.optional(Schema.Unknown),
  type: Schema.String,
})

const PcoWebhookPayload = Schema.Struct({
  body: Schema.Struct({
    data: Schema.Array(PcoWebhookData),
  }),
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
  orgId: Schema.String,
  webhookId: Schema.String,
})

class PcoWebhookError extends Schema.TaggedError<PcoWebhookError>()('PcoWebhookError', {
  cause: Schema.optional(Schema.Unknown),
  eventType: Schema.optional(Schema.String),
  message: Schema.String,
}) {}

export const PcoWebhookWorkflow = Workflow.make({
  error: PcoWebhookError,
  idempotencyKey: ({ webhookId, orgId }) => `pco-webhook-${webhookId}-${orgId}-${nanoid()}`,
  name: 'PcoWebhookWorkflow',
  payload: PcoWebhookPayload,
  success: Schema.Void,
})

export const PcoWebhookWorkflowLayer = PcoWebhookWorkflow.toLayer(
  Effect.fn('PcoWebhookWorkflow')(function* (payload, executionId) {
    yield* Effect.log(`Processing PCO webhook for org: ${payload.orgId}`)
    yield* Effect.log(`Execution ID: ${executionId}`)

    const { orgId, body } = payload
    const eventOpt = pipe(body.data, Array.head)

    if (Option.isNone(eventOpt)) {
      yield* Effect.log('No event data in webhook payload')
      return
    }

    const eventData = eventOpt.value
    const eventType = eventData.attributes.name
    const parsedPayload = JSON.parse(eventData.attributes.payload)

    yield* Effect.log(`Processing PCO event: ${eventType}`, {
      eventId: eventData.id,
      eventType,
    })

    yield* handlePcoEvent(orgId, eventType, parsedPayload).pipe(
      Effect.mapError(
        (error) =>
          new PcoWebhookError({
            cause: error,
            eventType,
            message: error.message || 'Failed to handle PCO event',
          }),
      ),
    )

    yield* Effect.log(`Completed processing PCO webhook event: ${eventType}`)
  }),
)

// Main event handler that routes to specific handlers
const handlePcoEvent = Effect.fn('handlePcoEvent')(function* (
  orgId: string,
  eventType: string,
  payload: any,
) {
  // Person events
  if (
    pipe(eventType, String.includes('person.created')) ||
    pipe(eventType, String.includes('person.updated'))
  ) {
    yield* handlePersonModify(orgId, payload.data.id)
    return
  }

  if (pipe(eventType, String.includes('person.destroyed'))) {
    yield* handlePersonDelete(orgId, payload.data.id)
    return
  }

  if (pipe(eventType, String.includes('person_merger.created'))) {
    yield* handlePersonMerge(
      orgId,
      payload.data.relationships.person_to_keep.data.id,
      payload.data.relationships.person_to_remove.data.id,
    )
    return
  }

  // Contact info events (phone, email, address)
  if (
    pipe(eventType, String.includes('phone_number.')) ||
    pipe(eventType, String.includes('email.')) ||
    pipe(eventType, String.includes('address.'))
  ) {
    if (pipe(eventType, String.includes('.destroyed'))) {
      // For deleted contact info, we still need to update the person
      yield* handlePersonModify(orgId, payload.data.relationships.person.data.id)
    } else {
      // For created/updated contact info
      yield* handlePersonModify(orgId, payload.data.relationships.person.data.id)
    }
    return
  }

  // Group events
  if (
    pipe(eventType, String.includes('group.created')) ||
    pipe(eventType, String.includes('group.updated'))
  ) {
    yield* handleGroupModify(orgId, payload.data.id)
    return
  }

  if (pipe(eventType, String.includes('group.destroyed'))) {
    yield* handleGroupDelete(orgId, payload.data.id)
    return
  }

  // Membership events
  if (pipe(eventType, String.includes('membership.'))) {
    yield* handleGroupModify(orgId, payload.data.relationships.group.data.id)
    return
  }

  // Giving events
  if (
    pipe(eventType, String.includes('donation.created')) ||
    pipe(eventType, String.includes('donation.updated'))
  ) {
    yield* handleDonationModify(orgId, payload.data.id)
    return
  }

  if (pipe(eventType, String.includes('donation.destroyed'))) {
    yield* handleDonationDelete(orgId, payload.data.id)
    return
  }

  if (
    pipe(eventType, String.includes('recurring_donation.created')) ||
    pipe(eventType, String.includes('recurring_donation.updated'))
  ) {
    yield* handleRecurringDonationModify(orgId, payload.data.id)
    return
  }

  if (pipe(eventType, String.includes('recurring_donation.destroyed'))) {
    yield* handleRecurringDonationDelete(orgId, payload.data.id)
    return
  }

  // Services events
  if (
    pipe(eventType, String.includes('plan.created')) ||
    pipe(eventType, String.includes('plan.updated'))
  ) {
    yield* handlePlanModify(orgId, payload.data.id, payload.data.relationships.service_type.data.id)
    return
  }

  if (pipe(eventType, String.includes('plan.destroyed'))) {
    yield* handlePlanDelete(orgId, payload.data.id)
    return
  }

  yield* Effect.log(`Unhandled PCO event type: ${eventType}`)
})

// Helper functions to trigger appropriate sync workflows
const handlePersonModify = Effect.fn('handlePersonModify')(function* (
  orgId: string,
  personExternalId: string,
) {
  yield* Effect.log(`Syncing person: ${personExternalId}`)

  // Create a CRUD mutation for syncing
  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'upsert',
            primaryKey: { externalId: personExternalId },
            tableName: 'people',
            value: { orgId, requiresSync: true },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  // Create the operation structure
  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'people',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'upsert',
          primaryKey: { key: 'externalId', value: personExternalId },
          tableName: 'people',
          value: { key: 'requiresSync', value: true },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handlePersonDelete = Effect.fn('handlePersonDelete')(function* (
  orgId: string,
  personExternalId: string,
) {
  yield* Effect.log(`Deleting person: ${personExternalId}`)

  // Create a CRUD mutation for deletion
  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'delete',
            primaryKey: { key: 'externalId', value: personExternalId },
            tableName: 'people',
            value: { key: 'externalId', value: personExternalId },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'people',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'delete',
          primaryKey: { key: 'externalId', value: personExternalId },
          tableName: 'people',
          value: { key: 'externalId', value: personExternalId },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handlePersonMerge = Effect.fn('handlePersonMerge')(function* (
  orgId: string,
  keepId: string,
  removeId: string,
) {
  yield* Effect.log(`Merging person ${removeId} into ${keepId}`)

  // Handle person merge by updating the kept person and removing the other
  yield* Effect.all([handlePersonModify(orgId, keepId), handlePersonDelete(orgId, removeId)])
})

const handleGroupModify = Effect.fn('handleGroupModify')(function* (
  orgId: string,
  groupExternalId: string,
) {
  yield* Effect.log(`Syncing group: ${groupExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'upsert',
            primaryKey: { externalId: groupExternalId },
            tableName: 'groups',
            value: { orgId, requiresSync: true },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'groups',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'upsert',
          primaryKey: { key: 'externalId', value: groupExternalId },
          tableName: 'groups',
          value: { key: 'requiresSync', value: true },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handleGroupDelete = Effect.fn('handleGroupDelete')(function* (
  orgId: string,
  groupExternalId: string,
) {
  yield* Effect.log(`Deleting group: ${groupExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'delete',
            primaryKey: { key: 'externalId', value: groupExternalId },
            tableName: 'groups',
            value: { key: 'externalId', value: groupExternalId },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'groups',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'delete',
          primaryKey: { key: 'externalId', value: groupExternalId },
          tableName: 'groups',
          value: { key: 'externalId', value: groupExternalId },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handleDonationModify = Effect.fn('handleDonationModify')(function* (
  orgId: string,
  donationExternalId: string,
) {
  yield* Effect.log(`Syncing donation: ${donationExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'upsert',
            primaryKey: { externalId: donationExternalId },
            tableName: 'donations',
            value: { orgId, requiresSync: true },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'donations',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'upsert',
          primaryKey: { key: 'externalId', value: donationExternalId },
          tableName: 'donations',
          value: { key: 'requiresSync', value: true },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handleDonationDelete = Effect.fn('handleDonationDelete')(function* (
  orgId: string,
  donationExternalId: string,
) {
  yield* Effect.log(`Deleting donation: ${donationExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'delete',
            primaryKey: { key: 'externalId', value: donationExternalId },
            tableName: 'donations',
            value: { key: 'externalId', value: donationExternalId },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'donations',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'delete',
          primaryKey: { key: 'externalId', value: donationExternalId },
          tableName: 'donations',
          value: { key: 'externalId', value: donationExternalId },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handleRecurringDonationModify = Effect.fn('handleRecurringDonationModify')(function* (
  orgId: string,
  recurringDonationExternalId: string,
) {
  yield* Effect.log(`Syncing recurring donation: ${recurringDonationExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'upsert',
            primaryKey: { externalId: recurringDonationExternalId },
            tableName: 'recurringDonations',
            value: { orgId, requiresSync: true },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'recurringDonations',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'upsert',
          primaryKey: { key: 'externalId', value: recurringDonationExternalId },
          tableName: 'recurringDonations',
          value: { key: 'requiresSync', value: true },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handleRecurringDonationDelete = Effect.fn('handleRecurringDonationDelete')(function* (
  orgId: string,
  recurringDonationExternalId: string,
) {
  yield* Effect.log(`Deleting recurring donation: ${recurringDonationExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'delete',
            primaryKey: { key: 'externalId', value: recurringDonationExternalId },
            tableName: 'recurringDonations',
            value: { key: 'externalId', value: recurringDonationExternalId },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'recurringDonations',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'delete',
          primaryKey: { key: 'externalId', value: recurringDonationExternalId },
          tableName: 'recurringDonations',
          value: { key: 'externalId', value: recurringDonationExternalId },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handlePlanModify = Effect.fn('handlePlanModify')(function* (
  orgId: string,
  planExternalId: string,
  serviceTypeExternalId: string,
) {
  yield* Effect.log(`Syncing plan: ${planExternalId} for service type: ${serviceTypeExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'upsert',
            primaryKey: { externalId: planExternalId },
            tableName: 'plans',
            value: { orgId, requiresSync: true, serviceTypeExternalId },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'plans',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'upsert',
          primaryKey: { key: 'externalId', value: planExternalId },
          tableName: 'plans',
          value: { key: 'requiresSync', value: true },
        },
      },
    ],
    tokenKey: orgId,
  })
})

const handlePlanDelete = Effect.fn('handlePlanDelete')(function* (
  orgId: string,
  planExternalId: string,
) {
  yield* Effect.log(`Deleting plan: ${planExternalId}`)

  const crudMutation: CRUDMutation = {
    args: [
      {
        ops: [
          {
            op: 'delete',
            primaryKey: { key: 'externalId', value: planExternalId },
            tableName: 'plans',
            value: { key: 'externalId', value: planExternalId },
          },
        ],
      },
    ],
    clientID: nanoid(),
    id: Date.now(),
    name: '_zero_crud',
    timestamp: Date.now(),
    type: 'crud',
  }

  yield* ExternalPushEntityWorkflow.execute({
    entityName: 'plans',
    mutations: [
      {
        mutation: crudMutation,
        op: {
          op: 'delete',
          primaryKey: { key: 'externalId', value: planExternalId },
          tableName: 'plans',
          value: { key: 'externalId', value: planExternalId },
        },
      },
    ],
    tokenKey: orgId,
  })
})
