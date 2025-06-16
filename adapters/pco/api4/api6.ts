import { PCOPerson } from '@openfaith/pco/people/pcoPersonSchema'
import { Schema } from 'effect'

/**
 * HTTP method type for API endpoints
 */
type Method = 'GET' // | 'POST' | 'PUT' | 'DELETE'

/**
 * Base definition for GET endpoint configuration
 * @template Api - The API schema type
 * @template Fields - Record of available fields for the entity
 * @template TModule - The API module name
 * @template TEntity - The entity name
 * @template TName - The endpoint name
 * @template OrderableFields - Array of fields that can be ordered by
 * @template QueryableFields - Array of fields that can be queried
 * @template Includes - Array of relationships that can be included
 * @template QueryableSpecial - Array of special query parameters
 * @template IsCollection - Whether this endpoint returns a collection
 */
type BaseGetEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Fields>,
  QueryableFields extends ReadonlyArray<keyof Fields>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
> = {
  /** Whether this endpoint returns a collection or single resource */
  isCollection: IsCollection
  /** Schema for the API resource */
  apiSchema: Schema.Schema<Api>
  /** Available relationships that can be included */
  includes: Includes
  /** API endpoint path */
  path: string
  /** Fields that can be used for ordering results */
  orderableBy: OrderableFields
  /** HTTP method for this endpoint */
  method: 'GET'
  /** API module name */
  module: TModule
  /** Entity name */
  entity: TEntity
  /** Endpoint name */
  name: TName
  /** Query configuration */
  queryableBy: {
    /** Fields that can be queried */
    fields: QueryableFields
    /** Special query parameters */
    special: QueryableSpecial
  }
}

/**
 * Full endpoint definition including response schema transformation
 * @template Api - The API schema type
 * @template Fields - Record of available fields for the entity
 * @template TModule - The API module name
 * @template TEntity - The entity name
 * @template TName - The endpoint name
 * @template OrderableFields - Array of fields that can be ordered by
 * @template QueryableFields - Array of fields that can be queried
 * @template Includes - Array of relationships that can be included
 * @template QueryableSpecial - Array of special query parameters
 * @template IsCollection - Whether this endpoint returns a collection
 */
type FullGetEndpointDefinition<
  Api,
  Fields extends Record<string, any>,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Fields>,
  QueryableFields extends ReadonlyArray<keyof Fields>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
> = BaseGetEndpointDefinition<
  Api,
  Fields,
  TModule,
  TEntity,
  TName,
  OrderableFields,
  QueryableFields,
  Includes,
  QueryableSpecial,
  IsCollection
>

/**
 * Creates a reusable `defineEndpoint` adapter for APIs with flat structure (no nested fields key)
 * @template TApiBase - The base shape that all resources must have
 * @returns A function to define endpoints for this API family
 */
function createApiAdapter<TApiBase extends Record<string, any>>(): <
  Api extends TApiBase,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Api>,
  QueryableFields extends ReadonlyArray<keyof Api>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
>(
  params: BaseGetEndpointDefinition<
    Api,
    Api,
    TModule,
    TEntity,
    TName,
    OrderableFields,
    QueryableFields,
    Includes,
    QueryableSpecial,
    IsCollection
  >,
) => FullGetEndpointDefinition<
  Api,
  Api,
  TModule,
  TEntity,
  TName,
  OrderableFields,
  QueryableFields,
  Includes,
  QueryableSpecial,
  IsCollection
>

/**
 * Creates a reusable `defineEndpoint` adapter for APIs with nested fields structure
 * @template TFieldsKey - The key of the property on the API resource that contains the filterable/orderable fields
 * @template TApiBase - The base shape that all resources must have
 * @returns A function to define endpoints for this API family
 */
function createApiAdapter<
  TFieldsKey extends string,
  TApiBase extends Record<TFieldsKey, Record<string, any>>,
>(): <
  Api extends TApiBase,
  TModule extends string,
  TEntity extends string,
  TName extends string,
  OrderableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
  QueryableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
  Includes extends ReadonlyArray<string>,
  QueryableSpecial extends ReadonlyArray<string>,
  IsCollection extends boolean,
>(
  params: BaseGetEndpointDefinition<
    Api,
    Api[TFieldsKey],
    TModule,
    TEntity,
    TName,
    OrderableFields,
    QueryableFields,
    Includes,
    QueryableSpecial,
    IsCollection
  >,
) => FullGetEndpointDefinition<
  Api,
  Api[TFieldsKey],
  TModule,
  TEntity,
  TName,
  OrderableFields,
  QueryableFields,
  Includes,
  QueryableSpecial,
  IsCollection
>

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
  /**
   * Defines an endpoint configuration for the API family
   * @template Api - The API schema type, must conform to the family's base shape
   * @template TModule - The API module name
   * @template TEntity - The entity name
   * @template TName - The endpoint name
   * @template OrderableFields - Array of fields that can be ordered by
   * @template QueryableFields - Array of fields that can be queried
   * @template Includes - Array of relationships that can be included
   * @template QueryableSpecial - Array of special query parameters
   * @template IsCollection - Whether this endpoint returns a collection
   * @param params - The endpoint configuration parameters
   * @returns A function that accepts a response transformer and returns the full endpoint definition
   */
  return function defineEndpoint<
    Api extends TApiBase,
    TModule extends string,
    TEntity extends string,
    TName extends string,
    OrderableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
    QueryableFields extends ReadonlyArray<keyof Api[TFieldsKey]>,
    Includes extends ReadonlyArray<string>,
    QueryableSpecial extends ReadonlyArray<string>,
    IsCollection extends boolean,
  >(
    params: BaseGetEndpointDefinition<
      Api,
      Api[TFieldsKey],
      TModule,
      TEntity,
      TName,
      OrderableFields,
      QueryableFields,
      Includes,
      QueryableSpecial,
      IsCollection
    >,
  ) {
    return params
  }
}

/**
 * Base shape for all PCO API resources
 */
type PCOApiBase = {
  readonly attributes: Record<string, any>
}

/** Creates a PCO collection response schema. */
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
      parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
      total_count: Schema.Number,
    }),
  })

/** Creates a PCO single resource response schema. */
const mkPcoSingleSchema = <A>(resourceSchema: Schema.Schema<A>) =>
  Schema.Struct({
    data: resourceSchema,
    included: Schema.Array(Schema.Unknown),
  })

/**
 * PCO API adapter configured for resources with attributes field
 */
const pcoApiAdapter = createApiAdapter<'attributes', PCOApiBase>()

/**
 * Endpoint definition for retrieving all people from PCO
 */
const getAllPeopleDefinition = pcoApiAdapter({
  apiSchema: PCOPerson,
  entity: 'Person',
  includes: [
    'addresses',
    'emails',
    'primary_campus',
    'field_data',
    'households',
    'inactive_reason',
    'marital_status',
    'name_prefix',
    'name_suffix',
    'organization',
    'person_apps',
    'phone_numbers',
    'platform_notifications',
    'primary_campus',
    'school',
    'social_profiles',
  ],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'getAll',
  orderableBy: [
    'accounting_administrator',
    'anniversary',
    'birthdate',
    'child',
    'created_at',
    'first_name',
    'gender',
    'given_name',
    'grade',
    'graduation_year',
    'inactivated_at',
    'membership',
    'middle_name',
    'nickname',
    'people_permissions',
    'remote_id',
    'site_administrator',
    'status',
    'updated_at',
  ],
  path: '/people/v2/people',
  queryableBy: {
    fields: [
      'accounting_administrator',
      'anniversary',
      'birthdate',
      'child',
      'created_at',
      'first_name',
      'gender',
      'given_name',
      'grade',
      'graduation_year',
      'inactivated_at',
      'last_name',
      'medical_notes',
      'membership',
      'middle_name',
      'nickname',
      'people_permissions',
      'remote_id',
      'site_administrator',
      'status',
      'updated_at',
    ],
    special: [
      'id',
      'date_time',
      'mfa_configured',
      'primary_campus_id',
      'search_name',
      'search_name_or_email',
      'search_name_or_email_or_phone_number',
      'search_phone_number',
      'search_phone_number_e164',
    ],
  },
})

/**
 * Base shape for all CCB API resources
 */
type CCBApiBase = {
  readonly id: number
}

/**
 * CCB API adapter configured for resources with flat structure
 */
const ccbApiAdapter = createApiAdapter<CCBApiBase>()

export const CCBIndividual = Schema.Struct({
  active: Schema.Boolean,
  addresses: Schema.optional(
    Schema.Struct({
      home: Schema.optional(
        Schema.Struct({
          city: Schema.String,
          country_iso: Schema.String,
          latitude: Schema.NullOr(Schema.String),
          longitude: Schema.NullOr(Schema.String),
          name: Schema.String,
          state: Schema.String,
          street: Schema.String,
          zip: Schema.String,
        }),
      ),
      mailing: Schema.optional(
        Schema.Struct({
          city: Schema.String,
          country_iso: Schema.String,
          latitude: Schema.NullOr(Schema.String),
          longitude: Schema.NullOr(Schema.String),
          name: Schema.String,
          state: Schema.String,
          street: Schema.String,
          zip: Schema.String,
        }),
      ),
      work: Schema.optional(
        Schema.Struct({
          city: Schema.String,
          country_iso: Schema.String,
          latitude: Schema.NullOr(Schema.String),
          longitude: Schema.NullOr(Schema.String),
          name: Schema.String,
          state: Schema.String,
          street: Schema.String,
          zip: Schema.String,
        }),
      ),
    }),
  ),
  approval_status_modifier_id: Schema.String,
  birthday: Schema.optional(Schema.String),
  campus_id: Schema.Number,
  created: Schema.String,
  date_child_work_start: Schema.NullOr(Schema.String),
  date_child_work_stop: Schema.NullOr(Schema.String),
  deceased: Schema.optional(Schema.String),
  denied_status_reason: Schema.NullOr(Schema.String),
  email: Schema.String,
  email_unsubscribed: Schema.Boolean,
  email_unsubscribed_reason: Schema.optional(
    Schema.Literal('API_UNSUBSCRIBED', 'DOMAIN_UNSUBSCRIBED', 'SITE_UNSUBSCRIBED'),
  ),
  family_id: Schema.Number,
  family_position: Schema.Literal('PRIMARY_CONTACT', 'SPOUSE', 'CHILD', 'OTHER'),
  first_name: Schema.String,
  gender: Schema.Literal('MALE', 'FEMALE', ''),
  id: Schema.Number,
  images: Schema.optional(
    Schema.Struct({
      large: Schema.String,
      medium: Schema.String,
      thumbnail: Schema.String,
    }),
  ),
  is_child_work_approved: Schema.Boolean,
  last_name: Schema.String,
  legal_first_name: Schema.optional(Schema.String),
  marital_status: Schema.Literal('MARRIED', 'SINGLE', 'WIDOWED', 'DIVORCED', 'SEPARATED', ''),
  membership_type_id: Schema.Number,
  middle_name: Schema.optional(Schema.String),
  name: Schema.String,
  name_prefix: Schema.optional(Schema.String),
  name_suffix: Schema.optional(Schema.String),
  phone: Schema.Struct({
    fax: Schema.String,
    home: Schema.String,
    mobile: Schema.String,
    mobile_carrier_id: Schema.optional(Schema.Number),
    pager: Schema.String,
    work: Schema.String,
  }),
  preferred_Number: Schema.optional(Schema.Literal('HOME', 'MOBILE', 'WORK', 'NONE', '')),
})

const getAllIndividualsDefinition = ccbApiAdapter({
  apiSchema: CCBIndividual,
  entity: 'Individual',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'individuals',
  name: 'getAll',
  orderableBy: [],
  path: '/individuals',
  queryableBy: {
    fields: [],
    special: [],
  },
})
