## `Edge`-Based Relationships: Unlocking Data Interconnectedness

A core innovation within the OpenFaith platform is its **`Edge`-Based Relationship Model**. This approach moves beyond the often rigid, predetermined links found in traditional Church Management Systems (ChMS) by providing a flexible and universal way to define, query, and manage connections between any two entities in the system.

### Deterministic Source/Target Assignment: The Alpha Pattern

To ensure consistency and avoid ambiguity in directionality, OpenFaith uses a deterministic, convention-based rule for assigning `sourceEntity` and `targetEntity` in an Edge:

- **Alpha Pattern Rule:**
  - Compare the first character of each entity's ID (or name, if preferred).
  - If one entity's first letter falls in the range A–M (1–13), it is assigned as the `sourceEntity`. If the other is in N–Z (14–26), it is the `targetEntity`.
  - **If both entities fall in the same alpha range (both A–M or both N–Z):**
    - Compare the full string values lexicographically (alphabetically). The entity with the lower value is the `sourceEntity`, the other is the `targetEntity`.
    - If the values are identical (extremely rare), use a secondary property (e.g., entity type, or a numeric ID if available) to break the tie.

**Example:**

- `alice` (A) and `bob` (B): Both A–M, so compare full string: `alice` < `bob` → `alice` is source, `bob` is target.
- `nancy` (N) and `bob` (B): `nancy` is N–Z, `bob` is A–M → `bob` is source, `nancy` is target.
- `zoe` (Z) and `yara` (Y): Both N–Z, so compare full string: `yara` < `zoe` → `yara` is source, `zoe` is target.

**Rationale:**

- This approach is fully deterministic and does not require developers or users to remember or look up relationship directionality for each type.
- It works for any entity type and any relationship, making the system highly dynamic and scalable.
- It avoids ambiguity and ensures that the same pair of entities will always be stored in the same direction, regardless of who creates the edge.

**Developer Note:**

- When creating an edge, always apply the alpha pattern rule to determine which entity is the source and which is the target.
- This rule should be encapsulated in a utility function used throughout the codebase.

**Example Utility Function (TypeScript):**

```ts
function getEdgeDirection(
  idA: string,
  idB: string
): { source: string; target: string } {
  const alphaRange = (id: string) => {
    const c = id[0].toLowerCase();
    return c >= "a" && c <= "m" ? "A-M" : "N-Z";
  };
  const rangeA = alphaRange(idA);
  const rangeB = alphaRange(idB);
  if (rangeA !== rangeB) {
    return rangeA === "A-M"
      ? { source: idA, target: idB }
      : { source: idB, target: idA };
  }
  // Same range: use full string comparison
  if (idA < idB) return { source: idA, target: idB };
  if (idB < idA) return { source: idB, target: idA };
  // Tie-breaker: use a secondary property (e.g., entity type)
  throw new Error("Cannot determine edge direction: IDs are identical");
}
```

### The Problem with Predetermined Links in Traditional ChMS

Most ChMS platforms define a fixed set of possible relationships: a `Person` can be in a `Group`; a `Donation` can be linked to a `Person` and a `Fund`; an `Event` can have `Attendees` (who are `People`). While these are essential, this fixed structure has limitations:

1.  **Inflexibility:** If you want to represent a relationship not explicitly designed into the ChMS, you often can't. For example:
    - Linking a `Person` to `Groups` they _might be suitable for_ based on interests or spiritual gifts.
    - Connecting a `MentoringPair` (which might itself be a `Group` or custom entity) consisting of two `People`.
    - Relating a specific `Sermon` (a `Document` or `Event` item) to a set of `DiscussionQuestions` (another `Document` or custom entity).
2.  **Difficulty with Nuance:** Standard links often lack the ability to store rich metadata _about the relationship itself_. For example, in a `Person` to `Group` membership:
    - What was the date they joined the group?
    - What is their role within that specific group (e.g., "Leader," "Member," "Apprentice")?
    - Is their membership "Active" or "Pending"?
      Traditional systems might add many specific columns to a join table, but this doesn't scale for arbitrary relationship types.
3.  **Siloed Data:** Because relationships are often hardcoded within modules, it can be difficult to see or query connections _across_ different data domains in holistic ways.

### The OpenFaith Solution: The `Edge` Entity

OpenFaith introduces a generic `Edge` entity as a first-class citizen in its Canonical Data Model (CDM). An `Edge` represents a directed connection between two entities, along with a type and optional metadata describing the nature of that connection.

**`Edge` Entity Schema (Key Fields):**

- `orgId` (The OpenFaith organization this link belongs to)
- `sourceEntityId` (ID of the starting entity of the relationship)
- `sourceEntityTypeTag` (The `_tag` of the source entity, e.g., "person", "group")
- `targetEntityId` (ID of the ending entity of the relationship)
- `targetEntityTypeTag` (The `_tag` of the target entity)
- `relationshipType` (A string defining the _meaning_ of the connection, e.g., "member_of", "attended", "suitable_for_group", "mentors", "discussed_in_sermon")
- `metadata` (JSONB field to store arbitrary key-value pairs describing the relationship itself, e.g., `{ "role": "leader", "join_date": "2023-01-15", "status": "active" }`)
- **Auditing Timestamps & User Tracking:** `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- **Soft Delete:** `deletedAt`, `deletedBy`

**Primary Key:**

- The combination of (`orgId`, `sourceEntityId`, `targetEntityId`, `relationshipType`) forms the composite primary key for the Edge table. There is no separate `id` field.

### How `Edge`s Empower OpenFaith

1.  **Universal Connectivity:**

    - Any entity can be linked to any other entity. A `Person` can be linked to a `Group` with a "member_of" edge, but also to another `Person` with a "spouse_of" or "mentor_for" edge, or to a `Skill` entity (if you define one) with a "possesses_skill" edge.
    - This allows for emergent, graph-like data structures that can more accurately model real-world ministry relationships.

2.  **Rich Relationship Context (Metadata on the Edge):**

    - The `metadata` field on the `Edge` itself is powerful. For a "member*of" edge between a `Person` and a `Group`, the `metadata` can store their role in that group, join date, custom notes about their involvement in \_that specific group*, etc., without cluttering the `Person` or `Group` entities.
    - This means the relationship itself carries its own descriptive data.

3.  **Addressing Unmet Needs – Beyond Simple Membership:**

    - **Prospective Links:** You can now easily represent "Person A _could be good for_ Group X" using an `Edge` with `relationshipType: "suitable_for_group"` and perhaps `metadata: {"reason": "interest_in_topic_Y"}`. This isn't about current membership but potential or suggested connections.
    - **Custom Relationship Types:** Churches can define their own `relationshipTypes` to model specific ministry processes or connections unique to their context.
    - **Inter-Module Connectivity:** An `Edge` can connect an `Event` from the Schedule module to a `Folder` in the Collection module (`relationshipType: "event_resources_in_folder"`).

4.  **Enhanced Querying and Insights:**

    - While querying graph-like structures requires specific approaches (e.g., recursive queries, graph database capabilities if OpenFaith integrates one), the potential for insights increases dramatically.
    - "Show me all People who `attended` Event X and are also marked as `suitable_for_group` Y but are not yet `member_of` Group Y."
    - "List all `Resources` (e.g., articles, videos) `tagged_with` 'Discipleship' that were `discussed_in_sermon` by Pastor Z."

5.  **AI-First Enablement:**
    - LLMs can leverage this rich relational data. A query like "Find me potential mentors for John Doe who are skilled in 'leadership' and are part of the 'North Campus'" becomes answerable by an AI that can understand and traverse these `Edge`s and their `metadata`.
    - The `relationshipType` and `metadata` on edges provide crucial semantic context for AI reasoning.

### Example Use Cases for `Edge`s:

- `(Person A) --member_of--> (Group X)`
  - `metadata: {"role": "Leader", "join_date": "2022-08-01"}`
- `(Person B) --suitable_for_group--> (Group Y)`
  - `metadata: {"interest_level": "high", "suggested_by": "user_Z"}`
- `(Sermon S1) --references_scripture--> (ScripturePassage P1)`
  - `metadata: {"verse_start": "John 3:16", "verse_end": "John 3:17"}`
- `(Event E1) --held_at--> (Location L1)`
- `(Document D1) --version_of--> (Document D0)`
  - `metadata: {"version_number": 2, "change_summary": "Updated introduction"}`

### Implementation Considerations

- **Query Performance:** Heavily relying on `Edge`s means the `Edge` table can grow very large. Efficient indexing on `sourceEntityId`, `targetEntityId`, `relationshipType`, and potentially fields within the `metadata` is critical.
- **Defining `relationshipType`s:** Organizations will need a way to manage and understand the `relationshipType`s they use. Some might be system-defined, others user-defined.
- **User Interface:** Presenting and managing these flexible relationships in a user-friendly way is a UI/UX challenge.
- **Alpha Pattern Enforcement:** All edge creation and querying logic should use the alpha pattern utility to ensure consistency. Document this pattern for all developers and contributors.

### Conclusion

The `Edge`-based relationship model is a fundamental shift from the limitations of hardcoded links in many traditional ChMS. By treating relationships as first-class entities with their own types and metadata, OpenFaith provides a significantly more flexible, extensible, and powerful way to represent the complex web of connections inherent in ministry. This not only improves data modeling capabilities but also opens up new possibilities for advanced querying, insights, and AI-driven interactions with church data.
