import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const pathwaysTable = pgTable(
  'pathways',
  (d) => ({
    _tag: d
      .char({ enum: ['pathway'], length: 7 })
      .default('pathway')
      .$type<'pathway'>()
      .notNull(),
    active: d.boolean().notNull().default(true),
    completionRule: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    description: d.text(),
    // Enrollment rules DSL (see docs/PathwayEnrollmentRules.md)
    enrollmentConfig: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    // Field-driven boards: link to a selectable Field (required)
    linkedFieldId: d.text().notNull(),
    name: d.text().notNull(),
    orgId: d.text().notNull(),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    // Derived board/option overrides and per-option config
    stepsConfig: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull().default('default'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    nameIdx: index('pathwayNameIdx').on(x.name),
    orgIdIdx: index('pathwayOrgIdIdx').on(x.orgId),
  }),
)

export const Pathway = createSelectSchema(pathwaysTable)
export type Pathway = typeof Pathway.Type

export const NewPathway = createInsertSchema(pathwaysTable)
export type NewPathway = typeof NewPathway.Type

// Pathway steps removed; pathway is driven by linked field + field option pathwayConfig

export const journeysTable = pgTable(
  'journeys',
  (d) => ({
    _tag: d
      .char({ enum: ['journey'], length: 7 })
      .default('journey')
      .$type<'journey'>()
      .notNull(),
    assimilationComplete: d.boolean().notNull().default(false),
    completedAt: d.timestamp(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    currentStage: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    lastActivityAt: d.timestamp(),
    orgId: d.text().notNull(),
    pathwayId: d.text().notNull(),
    state: d.text().notNull().default('active'), // pending | active | completed | archived
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    subjectId: d.text().notNull(),
    subjectTag: d.text().notNull(),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull().default('default'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    orgIdIdx: index('journeyOrgIdIdx').on(x.orgId),
    pathwayIdIdx: index('journeyPathwayIdIdx').on(x.pathwayId),
    stateIdx: index('journeyStateIdx').on(x.state),
    subjectIdx: index('journeySubjectIdx').on(x.subjectTag, x.subjectId),
  }),
)

export const Journey = createSelectSchema(journeysTable)
export type Journey = typeof Journey.Type

export const NewJourney = createInsertSchema(journeysTable)
export type NewJourney = typeof NewJourney.Type

// stepProgress removed; progress is inferred from field option changes and signals
