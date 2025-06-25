import type {
  BaseEndpointDefinition,
  DeleteEndpointDefinition,
  GetEndpointDefinition,
  PatchEndpointDefinition,
  PostEndpointDefinition,
} from '@openfaith/adapter-core/server'
import { Schema } from 'effect'

/**
 * Creates a PCO collection response schema.
 *
 * A GET request for a collection (e.g., `/people/v2/people`) returns a
 * comprehensive object with pagination and metadata following JSON:API spec.
 */
const mkPcoCollectionSchema = <A>(resourceSchema: Schema.Schema<A>) =>
  Schema.Struct({
    /** The 'data' key contains the array of primary resource objects. */
    data: Schema.Array(resourceSchema),

    /** The 'included' key contains side-loaded related resources. */
    included: Schema.Array(Schema.Unknown),

    /** The 'links' object contains pagination links. */
    links: Schema.Struct({
      next: Schema.optional(Schema.String),
      self: Schema.String,
    }),

    /** The 'meta' object contains counts and other metadata. */
    meta: Schema.Struct({
      can_include: Schema.optional(Schema.Array(Schema.String)),
      can_order_by: Schema.optional(Schema.Array(Schema.String)),
      can_query_by: Schema.optional(Schema.Array(Schema.String)),
      count: Schema.Number,
      next: Schema.optional(Schema.Struct({ offset: Schema.Number })),
      parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
      prev: Schema.optional(Schema.Struct({ offset: Schema.Number })),
      total_count: Schema.Number,
    }),
  })

/**
 * Creates a PCO single resource response schema.
 *
 * A GET request for a single item (e.g., `/people/v2/people/123`) returns an
 * object following JSON:API spec with data and included sections.
 */
const mkPcoSingleSchema = <A>(resourceSchema: Schema.Schema<A>) =>
  Schema.Struct({
    data: resourceSchema,
    included: Schema.Array(Schema.Unknown),
  })

/**
 * Creates a reusable `defineEndpoint` adapter for a specific family of APIs
 * that follow a consistent structure.
 *
 * @template TFieldsKey - The key of the property on the API resource that contains the filterable/orderable fields
 * @template TApiBase - The base shape that all resources must have
 * @param fieldsKey The key of the property on the API resource that contains the filterable/orderable fields
 * @returns A function to define endpoints for this API family
 */
function createApiAdapter<
  TFieldsKey extends string,
  TApiBase extends Record<TFieldsKey, Record<string, any>>,
>() {
  // GET Collection overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    OrderableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    Includes extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
  >(
    params: BaseEndpointDefinition<
      'GET',
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      true,
      never,
      never
    > & { isCollection: true },
  ): GetEndpointDefinition<
    Api,
    ReturnType<typeof mkPcoCollectionSchema<Api>>,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName,
    OrderableFields,
    QueryableFields,
    Includes,
    QueryableSpecial,
    true
  >

  // GET Single overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    OrderableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    QueryableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
    Includes extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
  >(
    params: BaseEndpointDefinition<
      'GET',
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      false,
      never,
      never
    > & { isCollection: false },
  ): GetEndpointDefinition<
    Api,
    ReturnType<typeof mkPcoSingleSchema<Api>>,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName,
    OrderableFields,
    QueryableFields,
    Includes,
    QueryableSpecial,
    false
  >

  // POST overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    CreatableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
  >(
    params: BaseEndpointDefinition<
      'POST',
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      never,
      never,
      never,
      never,
      false,
      CreatableFields,
      never
    >,
  ): PostEndpointDefinition<
    Api,
    ReturnType<typeof mkPcoSingleSchema<Api>>,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName,
    CreatableFields
  >

  // PATCH overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    UpdatableFields extends ReadonlyArray<Extract<keyof Api[TFieldsKey], string>>,
  >(
    params: BaseEndpointDefinition<
      'PATCH',
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      never,
      never,
      never,
      never,
      false,
      never,
      UpdatableFields
    >,
  ): PatchEndpointDefinition<
    Api,
    ReturnType<typeof mkPcoSingleSchema<Api>>,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName,
    UpdatableFields
  >

  // DELETE overload
  function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
  >(
    params: BaseEndpointDefinition<
      'DELETE',
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      never,
      never,
      never,
      never,
      false,
      never,
      never
    >,
  ): DeleteEndpointDefinition<
    Api,
    ReturnType<typeof mkPcoSingleSchema<Api>>,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName
  >

  // Implementation
  function defineEndpoint(params: any) {
    return {
      ...params,
      response:
        params.method === 'GET' && params.isCollection
          ? mkPcoCollectionSchema(params.apiSchema)
          : mkPcoSingleSchema(params.apiSchema),
    }
  }

  return defineEndpoint
}

/**
 * Base shape for all PCO API resources
 */
type PcoApiBase = {
  readonly attributes: Record<string, any>
}

/**
 * PCO API adapter configured for resources with attributes field
 */
export const pcoApiAdapter = createApiAdapter<'attributes', PcoApiBase>()
