import { Schema, type SchemaAST } from 'effect'
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
  Relationships extends Struct.Fields,
  Links extends Struct.Fields,
> = Struct<{
  attributes: Schema.Struct<Attributes>
  id: typeof Schema.String
  type: entityType<EntityType>
  relationships: Schema.Struct<Relationships>
  links: Schema.Struct<Links>
}>

export const mkPcoEntity = <
  EntityType extends SchemaAST.LiteralValue,
  Attributes extends Struct.Fields,
  Relationships extends Struct.Fields,
  Links extends Struct.Fields,
>(params: {
  type: EntityType
  attributes: Schema.Struct<Attributes>
  relationships: Schema.Struct<Relationships>
  links: Schema.Struct<Links>
}): PcoEntity<EntityType, Attributes, Relationships, Links> =>
  Struct({
    attributes: params.attributes,
    id: Schema.String,
    links: params.links,
    relationships: params.relationships,
    type: entityType(params.type),
  })

/**
 * Base schema for PCO webhook event payloads (what's inside the JSON string)
 */
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

/**
 * Base schema for PCO webhook event delivery
 */
export const mkPcoWebhookDelivery = <TData extends Schema.Schema.Any>(
  webhook: string,
  data: TData,
) =>
  Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        attributes: Schema.Struct({
          attempt: Schema.Number,
          name: Schema.Literal(webhook),
          // Parse the JSON string payload into a structured event
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
      }),
    ),
  })
