import { journeysTable, pathwaysTable } from '@openfaith/db'
import { type FieldConfig, OfEntity, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export class BasePathway extends BaseSystemFields.extend<BasePathway>('BasePathway')({
  _tag: Schema.Literal('pathway').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  active: Schema.Boolean.annotations({
    description: 'Pathway active flag',
    [OfUiConfig]: {
      table: { cellType: 'badge', filterable: true, order: 5, sortable: true },
    },
  }),
  completionRule: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }).annotations({
    description: 'Rule config for pathway completion',
    [OfUiConfig]: { table: { hidden: true } },
  }),
  description: Schema.String.pipe(Schema.NullOr).annotations({
    description: 'Optional description of the pathway',
    [OfUiConfig]: {
      table: { order: 3, sortable: true },
    },
  }),
  enrollmentConfig: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }).annotations({
    description: 'Enrollment rules DSL (see PathwayEnrollmentRules.md)',
    [OfUiConfig]: { table: { hidden: true } },
  }),
  linkedFieldId: Schema.String.annotations({
    description: 'Required link to a single-select Field that drives Kanban columns',
    [OfUiConfig]: { table: { order: 6, sortable: true } },
  }),
  name: Schema.String.annotations({
    description: 'Display name of the pathway',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 1,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  stepsConfig: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }).annotations({
    description: 'Field-driven board config and per-option overrides',
    [OfUiConfig]: { table: { hidden: true } },
  }),
}) {}

export class Pathway extends BasePathway.extend<Pathway>('Pathway')(BaseIdentifiedEntity.fields, [
  {
    [OfEntity]: 'pathway',
    [OfTable]: pathwaysTable,
    [OfUiConfig]: {
      navigation: {
        description: 'Define and manage funnels (generic across entities)',
        enabled: false,
        icon: 'milestoneIcon',
        module: 'domain',
        order: 7,
        title: 'Pathways',
      },
    } satisfies FieldConfig,
  },
]) {}

// Pathway steps removed in favor of fieldOption-level config

export class BaseJourney extends BaseSystemFields.extend<BaseJourney>('BaseJourney')({
  _tag: Schema.Literal('journey').annotations({
    [OfUiConfig]: { table: { hidden: true } },
  }),
  assimilationComplete: Schema.Boolean.annotations({
    description: 'Derived flag for people based on course policy',
    [OfUiConfig]: { table: { cellType: 'badge', order: 5 } },
  }),
  completedAt: Schema.String.pipe(Schema.NullOr).annotations({
    description: 'When the journey was completed',
    [OfUiConfig]: { table: { cellType: 'date', order: 6, sortable: true } },
  }),
  currentStage: Schema.String.pipe(Schema.NullOr).annotations({
    description: 'Current kanban stage override',
    [OfUiConfig]: { table: { order: 4, sortable: true } },
  }),
  lastActivityAt: Schema.String.pipe(Schema.NullOr).annotations({
    description: 'Last signal time considered for progress',
    [OfUiConfig]: { table: { cellType: 'date', order: 7, sortable: true } },
  }),
  pathwayId: Schema.String,
  state: Schema.String.annotations({
    description: 'pending | active | completed | archived',
    [OfUiConfig]: {
      table: { cellType: 'badge', filterable: true, order: 1, pinned: 'left' },
    },
  }),
  subjectId: Schema.String.annotations({
    description: 'ID of the subject entity',
    [OfUiConfig]: { table: { filterable: true, order: 3, sortable: true } },
  }),
  subjectTag: Schema.String.annotations({
    description: 'Entity tag of the subject (person, group, campus, etc.)',
    [OfUiConfig]: {
      table: { cellType: 'badge', filterable: true, order: 2, sortable: true },
    },
  }),
}) {}

export class Journey extends BaseJourney.extend<Journey>('Journey')(BaseIdentifiedEntity.fields, [
  {
    [OfEntity]: 'journey',
    [OfTable]: journeysTable,
    [OfUiConfig]: {
      navigation: {
        description: 'Track entity progress through a pathway',
        enabled: false,
        icon: 'kanbanIcon',
        module: 'domain',
        order: 9,
        title: 'Journeys',
      },
    } satisfies FieldConfig,
  },
]) {}

// StepProgress removed; progress is inferred from field option changes and signals
