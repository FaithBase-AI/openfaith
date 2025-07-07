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

export const PcoEntity = <
  Tag extends SchemaAST.LiteralValue,
  Attributes extends Struct.Fields,
  Relationships extends Struct.Fields,
  Links extends Struct.Fields,
>(
  value: Tag,
  attributes: Schema.Struct<Attributes>,
  relationships: Schema.Struct<Relationships>,
  links: Schema.Struct<Links>,
): PcoEntity<Tag, Attributes, Relationships, Links> =>
  Struct({
    attributes: attributes,
    id: Schema.String,
    links: links,
    relationships: relationships,
    type: entityType(value),
  })
