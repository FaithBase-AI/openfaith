import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const pathwaysTable = pgTable(
  'pathways',
  (d) => ({
    ...dbBaseEntityFields(d, 'pathway'),

    active: d.boolean().notNull().default(true),
    completionRule: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    description: d.text(),
    // Enrollment rules DSL (see docs/PathwayEnrollmentRules.md)
    enrollmentConfig: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    // Field-driven boards: link to a selectable Field (required)
    linkedFieldId: d.text().notNull(),
    name: d.text().notNull(),
    // Derived board/option overrides and per-option config
    stepsConfig: d.jsonb().$type<Record<string, unknown>>().notNull().default({}),
    type: d.text().notNull().default('default'),
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
    ...dbBaseEntityFields(d, 'journey'),

    assimilationComplete: d.boolean().notNull().default(false),
    completedAt: d.timestamp(),
    currentStage: d.text(),
    lastActivityAt: d.timestamp(),
    pathwayId: d.text().notNull(),
    state: d.text().notNull().default('active'), // pending | active | completed | archived
    subjectId: d.text().notNull(),
    subjectTag: d.text().notNull(),
    type: d.text().notNull().default('default'),
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
