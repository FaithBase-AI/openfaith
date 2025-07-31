import { Schema } from 'effect'

export const DetailsPaneEntity = Schema.Struct({
  _tag: Schema.Literal('entity'),
  entityId: Schema.String,
  entityType: Schema.String,
  tab: Schema.optional(Schema.String),
})
export type DetailsPaneEntity = Schema.Schema.Type<typeof DetailsPaneEntity>

export const DetailsPaneUnion = DetailsPaneEntity
export type DetailsPaneUnion = Schema.Schema.Type<typeof DetailsPaneUnion>

export const DetailsPaneParams = Schema.Array(DetailsPaneUnion)
export type DetailsPaneParams = Schema.Schema.Type<typeof DetailsPaneParams>
