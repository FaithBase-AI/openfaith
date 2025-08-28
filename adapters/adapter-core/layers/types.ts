import type { ExternalLink } from '@openfaith/db'
import type { CRUDOp } from '@openfaith/domain'
import type { EntityUnion } from '@openfaith/schema/shared/entityDiscovery'
import type { Effect } from 'effect'

// Shared callback interfaces for consistency across operations
export interface ExternalLinkInput {
  adapter: string // pco, ccb, breeze, etc.
  entityId?: string // Internal ID for linking (required for create operations)
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

// EntityData is now a union of all canonical OpenFaith entity types
export type EntityData = EntityUnion

export type ProcessEntities<BE, BR> = (data: Array<EntityData>) => Effect.Effect<void, BE, BR>

export interface RelationshipInput {
  // Entity identifiers (internal OpenFaith IDs)
  sourceEntityId: string
  targetEntityId: string

  // Entity type tags for proper edge creation
  sourceEntityTypeTag: string
  targetEntityTypeTag: string

  // Relationship metadata
  relationshipType: string // Full relationship type (e.g., "Person_has_Address")
  createdAt: Date

  // Audit and system fields (typically null for new relationships)
  createdBy: string | null
  deletedAt: Date | null
  deletedBy: string | null
  updatedAt: Date | null
  updatedBy: string | null

  // Optional metadata for additional relationship data
  metadata?: Record<string, unknown>
}

export type ProcessRelationships<CE, CR> = (
  relationships: Array<RelationshipInput>,
) => Effect.Effect<void, CE, CR>

export type ProcessMutations<DE, DR> = (mutations: Array<CRUDOp>) => Effect.Effect<void, DE, DR>
