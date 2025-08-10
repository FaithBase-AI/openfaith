## Pathways, Journeys, Step Progress, Qualifications, and Sacraments

This document explains the Pathways system and how it models funnels like Assimilation/Next Steps, how entities move through steps, and how achievements (Qualifications) are awarded and used for gating.

### Core concepts

- **Pathway (definition/template)**

  - Owns a set of ordered or staged steps that define a process (e.g., Assimilation).
  - Key fields: `name`, `description`, `active`, `completionRule`.
  - Not entity-specific; reusable for any subject type.

- **PathwayStep (step definition)**

  - Belongs to a `Pathway` and describes how a single step is labeled and completed.
  - Key fields: `key`, `label`, `stepType`, `stageName` (drives Kanban columns), `isRequiredForCompletion`, `prerequisites`, `autoCompleteRule`, `ordering`, `grantsQualifications`.
  - `autoCompleteRule` is a DSL (JSON) evaluated against signals like fields, edges, attendance, or activities (see Step Types below).
  - `grantsQualifications` lists achievement keys/ids to award when the step completes.

- **Journey (per-subject run)**

  - An instance of a subject (any entity) moving through a Pathway.
  - Key fields: `pathwayId`, `subjectTag` (e.g., `person`), `subjectId`, `state` (pending | active | completed | archived), `currentStage`, `completedAt`, `lastActivityAt`, `assimilationComplete` (derived in People flows).
  - Decoupled from “Assimilated”; a Journey may remain active after assimilation for placement steps.

- **StepProgress (per-journey step status)**

  - Tracks status per step within a Journey.
  - Key fields: `journeyId`, `stepId`, `progressState` (notStarted | inProgress | completed | skipped), `completedAt`, `evidence`, `notes`.

- **Qualification (achievement/badge)**

  - Represents things like `membership`, `freedom_class`, `discipleship_class`.
  - Steps can award qualifications via `grantsQualifications`. Awards are represented with Edges:
    - `(person) --has_qualification--> (qualification)` with metadata `{ awardedAt, source }`.
  - Teams/Groups can require qualifications for gating:
    - `(team) --requires_qualification--> (qualification)`.

- **Sacrament (Directory module)**
  - A first-class record of key spiritual milestones (e.g., `salvation`, `baptismWater`, `baptismHolySpirit`).
  - Schema keeps direct FKs for ownership and performance:
    - `receivedBy` (FK → `person`) and `administeredBy` (FK → `person`) annotated with `[OfForeignKey]` for UI.
  - Also participates in graph queries via Edges (`sourceEdges`/`targetEdges`).
  - Pathway steps may auto-complete when a matching Sacrament exists (see “Sacraments + Qualifications” below).

### What lives where

- Pathway: definition and rules; links to a single-select Field (`linkedFieldId`).
- Journey: who/what is moving through the Pathway.
- Qualification: distinct, reusable achievements; awarded by Step completion or other signals.

### Step types (extensible via `stepType` + `autoCompleteRule`)

- FieldPredicate: complete if a custom/base field satisfies a predicate (e.g., `nextStepsModules` contains `"101"`).
- EdgeExists: complete if an edge exists matching a predicate (e.g., person `member_of` group/team).
- Attendance: complete when attendance recorded for linked session(s).
- ActivityLogged: complete when an activity of a specific kind is logged on subject.
- EntityExists (optional): complete when a related entity record exists (e.g., a `sacrament` with `receivedBy = subjectId` and `type = baptismWater`). Can be implemented via `EdgeExists` if you standardize sacrament edges (see below), or via a targeted query.
- Manual: staff marks complete.

The underlying evaluator consumes `autoCompleteRule` in a stable JSON DSL. Start with FieldPredicate for a simple v1; add others as needed.

### Kanban behavior

- Columns come from `PathwayStep.stageName`.
- Each Journey card shows first incomplete step’s stage (or an override in `currentStage`).
- Cards can remain visible post-assimilation (e.g., for “Pick a Team”, “Find a Group”) until archived.

### Assimilation vs Courses (v1)

- “Assimilated” for People is defined as having completed the required Next Steps modules (e.g., 101–104).
- Model modules with FieldPredicate steps against a custom field like `nextStepsModules: ["101","102","103","104"]`.
- When all required steps complete, award the `membership` Qualification via `has_qualification` edge and set `membershipAt` in edge metadata.
- The Journey remains active for optional placement steps.

### Relationships: Edges vs FKs

- Use Edges for cross-entity links and gating:
  - `has_qualification`, `requires_qualification`, `member_of`, `attended`, `on_pathway` (optional convenience), etc.
- Keep direct FKs only for internal containment (e.g., `Journey.pathwayId`, `StepProgress.{journeyId, stepId}`) and well-scoped module FKs like `Sacrament.receivedBy`/`administeredBy`.

### Qualifications deep-dive

- Definition lives in `qualification` entity (key, name, description, status). It’s reusable and org-defined.
- Awarding
  - Primary: `PathwayStep.grantsQualifications` → on step completion, upsert `(person) --has_qualification--> (qualification)` with `{ awardedAt, source: 'pathwayStep', stepId }`.
  - Secondary signals: external events (attendance, edges, sacraments) can also trigger awards via the same edge.
- Gating
  - `(team|group|role) --requires_qualification--> (qualification)`; UI checks person’s `has_qualification` edges to determine eligibility.
- Canonical relationship types:
  - `has_qualification`, `requires_qualification`.

### Sacraments integration

- Data model
  - `sacrament` records include `type` (e.g., `salvation`, `baptismWater`, `baptismHolySpirit`), `receivedBy`, `administeredBy`, `occurredAt`.
  - UI uses `[OfForeignKey]` on `receivedBy`/`administeredBy` to render person pickers and link-outs. Relations also appear via `[OfRelations]` on `Person` and `Sacrament` schemas.
- Step auto-completion
  - Use one of:
    - `EntityExists` rule: “exists sacrament where `receivedBy = subjectId` and `type = 'baptismWater'`”.
    - Or standardize an edge when saving a sacrament: `(person) --received_sacrament--> (sacrament)`; then a step can use `EdgeExists` with `relationshipType: 'received_sacrament'` and `peerTag: 'sacrament'` plus metadata/type match.
- Awarding qualifications from sacraments
  - Map sacrament types to qualifications as desired, e.g.:
    - `salvation` → `qualification: 'salvation'`
    - `baptismWater` → `qualification: 'baptism_water'`
    - `baptismHolySpirit` → `qualification: 'baptism_holy_spirit'`
  - On sacrament creation, also upsert `(person) --has_qualification--> (qualification)` with `{ awardedAt: occurredAt, source: 'sacrament', sacramentId }`.
- Example step
  - “Baptism Completed” step:
    - `stepType: 'EntityExists'`
    - `autoCompleteRule: { type: 'EntityExists', entityTag: 'sacrament', where: { field: 'type', op: 'equals', value: 'baptismWater' } }`
    - `grantsQualifications: ['baptism_water']`

### Default org seeding (recommended)

- Create `Qualification`s: `membership`, `freedom_class`, `discipleship_class`.
- Create Pathway “Assimilation” with steps:
  - First Visit (optional), Follow-up (optional), Next Steps 101–104 (required), Pick a Team (optional), Find a Group (optional).
  - Map the final required step(s) to `grantsQualifications: ["membership"]` (or award when all required complete).
- Optionally create a “Freedom Class” Pathway that awards `freedom_class`.

### Example: Next Steps as FieldPredicate steps

```json
{
  "key": "ns-101",
  "label": "Next Steps 101",
  "stepType": "FieldPredicate",
  "stageName": "Next Steps",
  "isRequiredForCompletion": true,
  "autoCompleteRule": {
    "type": "FieldPredicate",
    "field": "nextStepsModules",
    "operator": "contains",
    "value": "101"
  }
}
```

### UI integration notes

- Person profile: show an “Assimilated” badge (from Qualification/edge) and link to Journey progress.
- Kanban view (by Pathway): columns from `stageName`, cards from `Journey`; filters for assimilated vs non-assimilated, stalled, completed-but-active.
- Qualifications: render as badges on person/team; use requires/has edges to gate actions.

### Indexing (DB)

- `journeys`: indexes on `(orgId)`, `(pathwayId)`, `(subjectTag, subjectId)`, `(state)`.
- `stepProgress`: indexes on `(journeyId)`, `(stepId)`, `(progressState)`.
- `edges`: already indexed by `(relationshipType)`, `(sourceEntityId)`, `(targetEntityId)`.

### Relationship type names (canonical)

- `has_qualification`, `requires_qualification`, `member_of`, `attended`, `on_pathway` (optional), `completed_step` (optional mirroring), `enrolled_in` (future courses), `received_sacrament` (optional if you mirror sacrament via edges).

### FAQ

- Which owns steps? — Pathway owns steps. Journey never defines steps; it references them via StepProgress.
- How do we keep people visible after assimilation? — Keep Journey `state='active'` until archive; show badge from Qualification.
- Can Pathways work for Groups/Teams/Campuses? — Yes. Journeys are subject-agnostic via `subjectTag`/`subjectId`.
- Do we need Courses now? — No. Start with FieldPredicate/Attendance steps and add course entities later if desired.
