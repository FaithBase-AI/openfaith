import { Option, pipe, Schema, type SchemaAST } from 'effect'
import {
  Literal,
  type PropertySignature,
  propertySignature,
  Struct,
  withConstructorDefault,
} from 'effect/Schema'

export interface entityType<EntityType extends SchemaAST.LiteralValue>
  extends PropertySignature<':', EntityType, never, ':', EntityType, true, never> {}

export const entityType = <EntityType extends SchemaAST.LiteralValue>(
  entityType: EntityType,
): entityType<EntityType> =>
  Literal(entityType).pipe(
    propertySignature,
    withConstructorDefault(() => entityType),
  )

export type PcoEntity<
  EntityType extends SchemaAST.LiteralValue,
  Attributes extends Struct.Fields,
  Links extends Struct.Fields,
  Relationships extends Struct.Fields | undefined = undefined,
> = Struct<
  {
    attributes: Schema.Struct<Attributes>
    id: typeof Schema.String
    type: entityType<EntityType>
    links: Schema.Struct<Links>
  } & (Relationships extends Struct.Fields ? { relationships: Schema.Struct<Relationships> } : {})
>

export const mkPcoEntity = <
  EntityType extends SchemaAST.LiteralValue,
  Attributes extends Struct.Fields,
  Links extends Struct.Fields,
  Relationships extends Struct.Fields | undefined = undefined,
>(params: {
  type: EntityType
  attributes: Schema.Struct<Attributes>
  relationships?: Relationships extends Struct.Fields ? Schema.Struct<Relationships> : undefined
  links: Schema.Struct<Links>
}): PcoEntity<EntityType, Attributes, Links, Relationships> =>
  Struct({
    attributes: params.attributes,
    id: Schema.String,
    links: params.links,
    type: entityType(params.type),
    ...pipe(
      params.relationships,
      Option.fromNullable,
      Option.match({
        onNone: () => ({}),
        onSome: (x) => ({
          relationships: x,
        }),
      }),
    ),
  }) as any

export const mkPcoWebhookPayload = <TData extends Schema.Schema.Any>(data: TData) =>
  Schema.Struct({
    data,
    included: Schema.Array(Schema.Unknown),
    meta: Schema.Struct({
      can_include: Schema.Array(Schema.String),
      parent: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('Organization'),
      }),
      public: Schema.optional(Schema.Unknown),
    }),
  })

export const mkPcoWebhookDelivery = <TData extends Schema.Schema.Any, WebhookName extends string>(
  webhook: WebhookName,
  data: TData,
) =>
  Schema.Struct({
    attributes: Schema.Struct({
      attempt: Schema.Number,
      name: Schema.Literal(webhook),
      payload: Schema.parseJson(mkPcoWebhookPayload(data)),
    }),
    id: Schema.String,
    relationships: Schema.Struct({
      organization: Schema.Struct({
        data: Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Organization'),
        }),
      }),
    }),
    type: Schema.Literal('EventDelivery'),
  })
