## Pathway Enrollment Rules (Spec / Mini PDR)

Goal: Allow Pathways to auto-enroll subjects (people, groups, etc.) via a shared, typed DSL stored in a single JSONB column, queriable on the backend and editable in the UI. Keep it simple, event-driven, and extensible.

### Data model (DB)

- Column: `pathways.enrollmentConfig jsonb not null default '{}'`
- Recommended GIN index: `CREATE INDEX IF NOT EXISTS pathways_enrollment_config_gin ON pathways USING GIN ("enrollmentConfig" jsonb_path_ops);`

Shape (stored as JSON):

```json
{
  "mode": "manual" | "auto",
  "rules": [ /* Rule[] (OR semantics) */ ],
  "options": {
    "allowedSubjectTags": ["person", "group", "campus"],
    "autoRemoveWhenFilterNotMatch": false,
    "autoArchiveOnComplete": false
  }
}
```

Semantics:

- `mode=manual`: ignore rules; enroll only by user action or explicit API.
- `mode=auto`: if any rule matches a subject AND subjectTag is allowed, then subject should be enrolled.
- If `rules` is empty and `mode=auto`, treat as "auto-all" for allowed subject tags.

### Shared Effect Schema (frontend/backend)

TypeScript (logical model to live under `@openfaith/schema/domain/ofPathwaySchema`):

```ts
type EnrollmentMode = "manual" | "auto";

type Predicate =
  | {
      type: "field";
      field: string;
      op:
        | "equals"
        | "notEquals"
        | "contains"
        | "in"
        | "gt"
        | "gte"
        | "lt"
        | "lte"
        | "exists";
      value?: unknown;
    }
  | {
      type: "edge";
      relationshipType: string;
      direction?: "outbound" | "inbound" | "both";
      peerTag?: string;
      peerIds?: ReadonlyArray<string>;
      metadataWhere?: Record<string, unknown>;
    }
  | {
      type: "qualification";
      keys: ReadonlyArray<string>;
      op?: "any" | "all" | "none";
    }
  | { type: "sacrament"; types: ReadonlyArray<string>; op?: "any" | "all" }
  | { type: "and"; predicates: ReadonlyArray<Predicate> }
  | { type: "or"; predicates: ReadonlyArray<Predicate> }
  | { type: "not"; predicate: Predicate };

type EnrollmentRule = Predicate; // OR semantics across top-level rules

type EnrollmentOptions = {
  allowedSubjectTags?: ReadonlyArray<string>;
  autoRemoveWhenFilterNotMatch?: boolean;
  autoArchiveOnComplete?: boolean;
};

type EnrollmentConfig = {
  mode: EnrollmentMode;
  rules?: ReadonlyArray<EnrollmentRule>;
  options?: EnrollmentOptions;
};
```

Notes:

- Keep rules disjunctive (OR). Complex logic uses `and/or/not` combinators inside rules.
- `qualification` checks `has_qualification` edges.
- `sacrament` checks sacrament records (or a standardized edge like `received_sacrament`).
- With field-driven pathways (every pathway has `linkedFieldId`), evaluators can react to `FieldOption` changes for enrollment or state updates.

### Evaluator (backend service)

Signature (Effect):

```ts
shouldEnroll(subject: { tag: string; id: string }, pathwayId: string): Effect.Effect<boolean>
```

Inputs loaded on demand:

- Subject snapshot (core fields + tags + customFields)
- Edges for subject (filtered by relationship types used in rules)
- Qualifications (via `has_qualification` edges)
- Sacraments (by FK or via edges)

Algorithm:

- If `mode=manual` → false
- If `mode=auto` and subject.tag ∈ allowedSubjectTags (or no restriction):
  - If rules length === 0 → true (auto-all)
  - Else evaluate OR over `rules` using the Predicate DSL

Actions on result:

- true and no active Journey → create Journey(state='active')
- false and active Journey and `autoRemoveWhenFilterNotMatch=true` → archive or remove Journey (configurable)
- On `autoArchiveOnComplete=true`, archive Journey when StepProgress indicates completion

### Triggers (event-driven)

Recompute for impacted subjects when:

- Subject created/updated (fields/customFields/tags)
- Edges added/removed/updated (member_of, has_qualification, received_sacrament, etc.)
- Sacrament created/updated for a person
- Qualification edges change

Batch reconciliation:

- Nightly job per org: scan all `mode=auto` pathways; for each allowed subject tag, process subjects in chunks

### Querying (server)

Find auto pathways for a given subject tag:

```sql
SELECT id
FROM pathways
WHERE (enrollmentConfig ->> 'mode') = 'auto'
  AND (
    jsonb_typeof(enrollmentConfig->'options'->'allowedSubjectTags') IS NULL
     OR (enrollmentConfig->'options'->'allowedSubjectTags') ? :subjectTag
  );
```

Then evaluate rules in app code (Effect) for only those pathways.

### UI builder

- Use shared Effect Schema to render a Rule builder:
  - Field predicate (pick field, operator, value)
  - Edge predicate (relationshipType + peerTag/ids)
  - Qualification predicate (select quals, any/all/none)
  - Sacrament predicate (select types, any/all)
  - And/Or/Not combinators
- `mode` toggle: manual vs auto; auto-all if no rules
- Options: allowedSubjectTags, auto-remove, auto-archive-on-complete

### Examples

1. Auto-add everyone:

```json
{ "mode": "auto", "rules": [], "options": { "allowedSubjectTags": ["person"] } }
```

2. People in Group A AND Team B:

```json
{
  "mode": "auto",
  "rules": [
    {
      "type": "and",
      "predicates": [
        {
          "type": "edge",
          "relationshipType": "member_of",
          "peerIds": ["group_a_id"]
        },
        {
          "type": "edge",
          "relationshipType": "member_of",
          "peerIds": ["team_b_id"]
        }
      ]
    }
  ],
  "options": {
    "allowedSubjectTags": ["person"],
    "autoRemoveWhenFilterNotMatch": true
  }
}
```

3. Auto-enroll assimilated members only:

```json
{
  "mode": "auto",
  "rules": [{ "type": "qualification", "keys": ["membership"], "op": "any" }],
  "options": { "allowedSubjectTags": ["person"] }
}
```

4. Baptized people:

```json
{
  "mode": "auto",
  "rules": [{ "type": "sacrament", "types": ["baptismWater"], "op": "any" }],
  "options": { "allowedSubjectTags": ["person"] }
}
```

### Observability & safety

- Log enroll/unenroll decisions with rule snapshot and key facts (edges/fields) used.
- Idempotent journey upsert.
- Backoff and batching for large reconciliations.

### Migration & compatibility

- Single JSONB column is additive; existing pathways default to `{ mode: 'manual' }`.
- If we later need multiple distinct rule sets per pathway, we can introduce a child table `pathwayEnrollmentRules(pathwayId, order, rule jsonb)` and keep the same DSL/evaluator.
