// import { PCOPerson } from '@openfaith/pco/people/pcoPersonSchema'
// import { Array, pipe, Schema } from 'effect'

// /**
//  * Base type for all PCO API resources.
//  *
//  * All PCO API resources must have at minimum a `type` field and an `attributes` object.
//  * This follows the JSON:API specification structure.
//  */
// type ApiBase = {
//   /** The type identifier for the resource (e.g., "Person", "Event", etc.) */
//   type: string
//   /** The attributes object containing the resource's data fields */
//   attributes: Record<string, any>
// }

// /**
//  * Type for collection schema function that transforms a resource schema into a collection response schema
//  */
// type CollectionSchemaFn<A, B> = (resourceSchema: Schema.Schema<A>) => Schema.Schema<B>

// /**
//  * Type for single schema function that transforms a resource schema into a single resource response schema
//  */
// type SingleSchemaFn<A, B> = (resourceSchema: Schema.Schema<A>) => Schema.Schema<B>

// /**
//  * Creates a PCO collection response schema.
//  *
//  * A GET request for a collection (e.g., `/people/v2/people`) returns a
//  * comprehensive object with pagination and metadata following JSON:API spec.
//  */
// const mkPcoCollectionSchema = <A extends ApiBase>(resourceSchema: Schema.Schema<A>) => {
//   return Schema.Struct({
//     /** The 'data' key contains the array of primary resource objects. */
//     data: Schema.Array(resourceSchema),

//     /** The 'included' key contains side-loaded related resources. */
//     included: Schema.Array(Schema.Unknown),

//     /** The 'links' object contains pagination links. */
//     links: Schema.Struct({
//       next: Schema.optional(Schema.String),
//       self: Schema.String,
//     }),

//     /** The 'meta' object contains counts and other metadata. */
//     meta: Schema.Struct({
//       can_include: Schema.optional(Schema.Array(Schema.String)),
//       can_order_by: Schema.optional(Schema.Array(Schema.String)),
//       can_query_by: Schema.optional(Schema.Array(Schema.String)),
//       count: Schema.Number,
//       parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
//       total_count: Schema.Number,
//     }),
//   })
// }

// /**
//  * Creates a PCO single resource response schema.
//  *
//  * A GET request for a single item (e.g., `/people/v2/people/123`) returns an
//  * object following JSON:API spec with data and included sections.
//  */
// const mkPcoSingleSchema = <A extends ApiBase>(resourceSchema: Schema.Schema<A>) => {
//   return Schema.Struct({
//     data: resourceSchema,
//     included: Schema.Array(Schema.Unknown),
//   })
// }

// /**
//  * Supported HTTP methods for API endpoints.
//  */
// type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

// /**
//  * Type definition for a GET endpoint configuration.
//  *
//  * @template Api - The API resource type that extends ApiBase
//  * @template TModule - The PCO module name (e.g., "people", "events")
//  * @template TEntity - The entity name (e.g., "Person", "Event")
//  * @template TName - The endpoint operation name (e.g., "getAll", "getById")
//  * @template Includes - Array of includable related resources
//  * @template QueryableSpecial - Array of special query parameters
//  * @template IsCollection - Whether this endpoint returns a collection or single resource
//  */
// type GetEndpointDefinition<
//   Api extends ApiBase,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   Includes extends Array<string>,
//   QueryableSpecial extends Array<string>,
//   IsCollection extends boolean,
// > = {
//   /** Whether this endpoint returns a collection (true) or single resource (false) */
//   isCollection: IsCollection
//   /** The Effect schema for the API resource */
//   apiSchema: Schema.Schema<Api>
//   /** The response schema, either collection or single based on isCollection */
//   responseSchema: IsCollection extends true
//     ? ReturnType<CollectionSchemaFn<Api, Api>>
//     : ReturnType<SingleSchemaFn<Api, Api>>
//   /** Array of related resources that can be included via ?include= parameter */
//   includes: Includes
//   /** The API endpoint path (e.g., "/people/v2/people") */
//   path: string
//   /** Array of fields that can be used for sorting via ?order= parameter */
//   orderableBy: Array<keyof Api['attributes']>
//   /** HTTP method - always 'GET' for this type */
//   method: 'GET'
//   /** The PCO module this endpoint belongs to */
//   module: TModule
//   /** The entity type this endpoint operates on */
//   entity: TEntity
//   /** The operation name for this endpoint */
//   name: TName
//   /** Configuration for query parameters */
//   queryableBy: {
//     /** Fields that can be queried directly */
//     fields: Array<keyof Api['attributes']>
//     /** Special query parameters specific to this endpoint */
//     special: QueryableSpecial
//   }
// }

// /**
//  * Type definition for a POST endpoint configuration.
//  *
//  * @template Api - The API resource type that extends ApiBase
//  * @template TModule - The PCO module name (e.g., "people", "events")
//  * @template TEntity - The entity name (e.g., "Person", "Event")
//  * @template TName - The endpoint operation name (e.g., "create")
//  */
// type PostEndpointDefinition<
//   Api extends ApiBase,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
// > = {
//   /** The Effect schema for the API resource */
//   apiSchema: Schema.Schema<Api>
//   /** The API endpoint path */
//   path: string
//   /** HTTP method - always 'POST' for this type */
//   method: 'POST'
//   /** The PCO module this endpoint belongs to */
//   module: TModule
//   /** The entity type this endpoint operates on */
//   entity: TEntity
//   /** The operation name for this endpoint */
//   name: TName
//   /** Array of fields that can be set when creating a new resource */
//   creatableFields: Array<keyof Api['attributes']>
//   /** The response schema for successful creation */
//   responseSchema: ReturnType<SingleSchemaFn<Api, Api>>
// }

// /**
//  * Union type for all possible endpoint definitions based on HTTP method.
//  *
//  * @template TMethod - The HTTP method type
//  * @template Api - The API resource type
//  * @template TModule - The PCO module name
//  * @template TEntity - The entity name
//  * @template TName - The endpoint operation name
//  * @template Includes - Array of includable related resources
//  * @template QueryableSpecial - Array of special query parameters
//  * @template IsCollection - Whether this endpoint returns a collection
//  */
// type EndpointDefinition<
//   TMethod extends Method,
//   Api extends ApiBase,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   Includes extends Array<string>,
//   QueryableSpecial extends Array<string>,
//   IsCollection extends boolean,
// > = TMethod extends 'GET'
//   ? GetEndpointDefinition<Api, TModule, TEntity, TName, Includes, QueryableSpecial, IsCollection>
//   : TMethod extends 'POST'
//     ? PostEndpointDefinition<Api, TModule, TEntity, TName>
//     : never

// /**
//  * Parameters type for defining an endpoint, excluding the auto-generated responseSchema.
//  *
//  * @template TMethod - The HTTP method type
//  * @template Api - The API resource type
//  * @template TModule - The PCO module name
//  * @template TEntity - The entity name
//  * @template TName - The endpoint operation name
//  * @template Includes - Array of includable related resources
//  * @template QueryableSpecial - Array of special query parameters
//  * @template IsCollection - Whether this endpoint returns a collection
//  */
// type DefineEndpointParams<
//   TMethod extends Method,
//   Api extends ApiBase,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   Includes extends Array<string>,
//   QueryableSpecial extends Array<string>,
//   IsCollection extends boolean,
// > = TMethod extends 'GET'
//   ? Omit<
//       GetEndpointDefinition<Api, TModule, TEntity, TName, Includes, QueryableSpecial, IsCollection>,
//       'responseSchema'
//     >
//   : TMethod extends 'POST'
//     ? Omit<PostEndpointDefinition<Api, TModule, TEntity, TName>, 'responseSchema'>
//     : never

// /**
//  * Creates an API adapter with the provided schema functions.
//  * Returns a defineEndpoint function that has access to the schema functions via closure.
//  *
//  * @param collectionSchemaFn - Function to create collection response schemas
//  * @param singleSchemaFn - Function to create single resource response schemas
//  * @returns A defineEndpoint function with the schema functions closed over
//  */
// const mkApiAdapter = <CA, CB, SA, SB>(
//   collectionSchemaFn: CollectionSchemaFn<CA, CB>,
//   singleSchemaFn: SingleSchemaFn<SA, SB>,
// ) => {
//   /**
//    * Function overload for defining GET endpoints.
//    */
//   function defineEndpoint<
//     Api extends ApiBase,
//     TModule extends string,
//     TEntity extends string,
//     TName extends string,
//     Includes extends Array<string>,
//     QueryableSpecial extends Array<string>,
//     IsCollection extends boolean,
//   >(
//     params: DefineEndpointParams<
//       'GET',
//       Api,
//       TModule,
//       TEntity,
//       TName,
//       Includes,
//       QueryableSpecial,
//       IsCollection
//     >,
//   ): GetEndpointDefinition<Api, TModule, TEntity, TName, Includes, QueryableSpecial, IsCollection>

//   /**
//    * Function overload for defining POST endpoints.
//    */
//   function defineEndpoint<
//     Api extends ApiBase,
//     TModule extends string,
//     TEntity extends string,
//     TName extends string,
//   >(
//     params: DefineEndpointParams<'POST', Api, TModule, TEntity, TName, never, never, never>,
//   ): PostEndpointDefinition<Api, TModule, TEntity, TName>

//   /**
//    * General function signature for defining API endpoints with proper type narrowing.
//    *
//    * This function creates endpoint definitions with automatically generated response schemas
//    * based on the HTTP method and whether the endpoint returns a collection or single resource.
//    */
//   function defineEndpoint<
//     TMethod extends Method,
//     Api extends ApiBase,
//     TModule extends string,
//     TEntity extends string,
//     TName extends string,
//     Includes extends Array<string>,
//     QueryableSpecial extends Array<string>,
//     IsCollection extends boolean,
//   >(
//     params: DefineEndpointParams<
//       TMethod,
//       Api,
//       TModule,
//       TEntity,
//       TName,
//       Includes,
//       QueryableSpecial,
//       IsCollection
//     >,
//   ): TMethod extends 'GET'
//     ? GetEndpointDefinition<Api, TModule, TEntity, TName, Includes, QueryableSpecial, IsCollection>
//     : TMethod extends 'POST'
//       ? PostEndpointDefinition<Api, TModule, TEntity, TName>
//       : never {
//     if (params.method === 'GET') {
//       return {
//         ...params,
//         responseSchema: (params as any).isCollection
//           ? collectionSchemaFn(params.apiSchema)
//           : singleSchemaFn(params.apiSchema),
//       } as any
//     }
//     return {
//       ...params,
//       responseSchema: singleSchemaFn(params.apiSchema),
//     } as any
//   }

//   return defineEndpoint
// }

// /**
//  * PCO API adapter with the proper schema functions
//  */
// const pcoApiAdapter = mkApiAdapter(mkPcoCollectionSchema, mkPcoSingleSchema)

// /**
//  * Endpoint definition for retrieving all people from PCO People API.
//  *
//  * This endpoint provides access to the `/people/v2/people` collection endpoint
//  * with comprehensive query, filtering, and inclusion capabilities.
//  */
// export const getAllPeopleDefinition = pcoApiAdapter({
//   apiSchema: PCOPerson,
//   entity: 'Person',
//   includes: [
//     'addresses',
//     'emails',
//     'primary_campus',
//     'field_data',
//     'households',
//     'inactive_reason',
//     'marital_status',
//     'name_prefix',
//     'name_suffix',
//     'organization',
//     'person_apps',
//     'phone_numbers',
//     'platform_notifications',
//     'primary_campus',
//     'school',
//     'social_profiles',
//   ],
//   isCollection: true,
//   method: 'GET',
//   module: 'people',
//   name: 'getAll',
//   orderableBy: [
//     'accounting_administrator',
//     'anniversary',
//     'birthdate',
//     'child',
//     'created_at',
//     'first_name',
//     'gender',
//     'given_name',
//     'grade',
//     'graduation_year',
//     'inactivated_at',
//     'membership',
//     'middle_name',
//     'nickname',
//     'people_permissions',
//     'remote_id',
//     'site_administrator',
//     'status',
//     'updated_at',
//   ],
//   path: '/people/v2/people',
//   queryableBy: {
//     fields: [
//       'accounting_administrator',
//       'anniversary',
//       'birthdate',
//       'child',
//       'created_at',
//       'first_name',
//       'gender',
//       'given_name',
//       'grade',
//       'graduation_year',
//       'inactivated_at',
//       'last_name',
//       'medical_notes',
//       'membership',
//       'middle_name',
//       'nickname',
//       'people_permissions',
//       'remote_id',
//       'site_administrator',
//       'status',
//       'updated_at',
//     ],
//     special: [
//       'id',
//       'date_time',
//       'mfa_configured',
//       'primary_campus_id',
//       'search_name',
//       'search_name_or_email',
//       'search_name_or_email_or_phone_number',
//       'search_phone_number',
//       'search_phone_number_e164',
//     ],
//   },
// })

// /**
//  * Creates a PCO entity manifest from an array of endpoint definitions.
//  *
//  * This function groups endpoints by entity type and creates a structured manifest
//  * that provides organized access to all endpoints for each entity, along with
//  * their associated schemas and metadata.
//  *
//  * @template Endpoints - Array type of endpoint definitions
//  * @param endpoints - Array of endpoint definitions to group by entity
//  * @returns A record mapping entity names to their manifest objects containing
//  *          apiSchema, endpoints, entity name, and module information
//  */
// const mkPcoEntityManifest = <
//   Endpoints extends Array<EndpointDefinition<Method, any, any, any, any, any, any, any>>,
// >(
//   endpoints: Endpoints,
// ): Record<
//   Endpoints[number]['entity'],
//   {
//     /** The Effect schema for this entity's API resource */
//     apiSchema: Endpoints[number]['apiSchema']
//     /** Record of all endpoints for this entity, keyed by endpoint name */
//     endpoints: Record<Endpoints[number]['name'], Endpoints[number]>
//     /** The entity name */
//     entity: Endpoints[number]['entity']
//     /** The PCO module this entity belongs to */
//     module: Endpoints[number]['module']
//   }
// > =>
//   pipe(
//     endpoints,
//     Array.groupBy((x) => x.entity),
//     (grouped) =>
//       Object.fromEntries(
//         Object.entries(grouped).map(([entity, entityEndpoints]) => {
//           const firstEndpoint = entityEndpoints[0]

//           return [
//             entity,
//             {
//               apiSchema: firstEndpoint.apiSchema,
//               endpoints: Object.fromEntries(
//                 entityEndpoints.map((endpoint) => {
//                   return [endpoint.name, endpoint]
//                 }),
//               ),
//               entity: entity,
//               module: firstEndpoint.module,
//             },
//           ]
//         }),
//       ),
//   ) as any

// /**
//  * The PCO entity manifest containing all defined endpoints grouped by entity.
//  *
//  * This provides a structured way to access endpoint definitions, schemas,
//  * and metadata organized by entity type (e.g., Person, Event, etc.).
//  */
// const pcoEntityManifest = mkPcoEntityManifest([getAllPeopleDefinition]).Person.endpoints.getAll
//   .responseSchema
