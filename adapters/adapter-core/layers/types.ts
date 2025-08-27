import type { CRUDOp } from '@openfaith/domain'
import type { ExternalLink } from '@openfaith/schema'
import type { Effect } from 'effect'

// Shared callback interfaces for consistency across operations
export interface ExternalLinkInput {
  adapter: string // pco, ccb, breeze, etc.
  internalId?: string // Internal ID for linking (required for create operations)
  externalId: string
  entityType: string // The OF entity type (e.g., "person", "campus")

  // Optional - for full sync (from actual entity data)
  createdAt?: string
  updatedAt?: string

  // Optional - for tracking what changed
  attributes?: Record<string, unknown> // Raw external attributes if needed
}

export type ProcessExternalLinks<AE, AR> = (
  externalLinks: Array<ExternalLinkInput>,
) => Effect.Effect<Array<ExternalLink>, AE, AR>

export interface EntityData {
  id: string
  [key: string]: unknown
}

export type ProcessEntities<BE, BR> = (data: Array<EntityData>) => Effect.Effect<void, BE, BR>

export interface RelationshipInput {
  sourceEntityId: string // Internal ID from external links
  targetExternalId: string // External ID of target
  targetType: string // Type of target entity
  relationshipKey: string // Relationship name
  metadata?: Record<string, unknown>
}

export type ProcessRelationships<CE, CR> = (
  relationships: Array<RelationshipInput>,
) => Effect.Effect<void, CE, CR>

export type ProcessMutations<DE, DR> = (mutations: Array<CRUDOp>) => Effect.Effect<void, DE, DR>
