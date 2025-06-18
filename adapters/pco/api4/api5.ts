// import { PCOPerson } from '@openfaith/pco/people/pcoPersonSchema'
// import type { Schema } from 'effect'

// type Method = 'GET' // | 'POST' | 'PUT' | 'DELETE'

// type BaseGetEndpointDefinition<
//   Api,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   Fields extends Array<string>,
//   Includes extends Array<string>,
//   QueryableSpecial extends Array<string>,
//   IsCollection extends boolean,
// > = {
//   /** Whether this endpoint returns a collection (true) or single resource (false) */
//   isCollection: IsCollection
//   /** The Effect schema for the API resource */
//   apiSchema: Schema.Schema<Api>
//   /** The response schema, either collection or single based on isCollection */
//   // responseSchema: Schema.Schema<Response>
//   /** Array of related resources that can be included via ?include= parameter */
//   includes: Includes
//   /** The API endpoint path (e.g., "/people/v2/people") */
//   path: string
//   /** Array of fields that can be used for sorting via ?order= parameter */
//   orderableBy: Fields
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
//     fields: Fields
//     /** Special query parameters specific to this endpoint */
//     special: QueryableSpecial
//   }
// }

// type FullGetEndpointDefinition<
//   Api,
//   Response,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   Fields extends Array<string>,
//   Includes extends Array<string>,
//   QueryableSpecial extends Array<string>,
//   IsCollection extends boolean,
// > = BaseGetEndpointDefinition<
//   Api,
//   TModule,
//   TEntity,
//   TName,
//   Fields,
//   Includes,
//   QueryableSpecial,
//   IsCollection
// > & {
//   responseSchema: Schema.Schema<Response>
// }

// type DefineEndpointParams<
//   TMethod extends Method,
//   Api,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   Fields extends Array<string>,
//   Includes extends Array<string>,
//   QueryableSpecial extends Array<string>,
//   IsCollection extends boolean,
// > = TMethod extends 'GET'
//   ? BaseGetEndpointDefinition<
//       Api,
//       TModule,
//       TEntity,
//       TName,
//       Fields,
//       Includes,
//       QueryableSpecial,
//       IsCollection
//     >
//   : never

// function defineEndpoint<
//   TMethod extends Method,
//   Api,
//   TModule extends string,
//   TEntity extends string,
//   TName extends string,
//   Fields extends Array<string>,
//   Includes extends Array<string>,
//   QueryableSpecial extends Array<string>,
//   IsCollection extends boolean,
// >(
//   params: DefineEndpointParams<
//     TMethod,
//     Api,
//     TModule,
//     TEntity,
//     TName,
//     Fields,
//     Includes,
//     QueryableSpecial,
//     IsCollection
//   >,
// ) {
//   return <Response>(
//     responseTransformer: (resourceSchema: Schema.Schema<Api>) => Schema.Schema<Response>,
//   ): FullGetEndpointDefinition<
//     Api,
//     Response,
//     TModule,
//     TEntity,
//     TName,
//     Fields,
//     Includes,
//     QueryableSpecial,
//     IsCollection
//   > => ({
//     ...params,
//     responseSchema: responseTransformer(params.apiSchema),
//   })
// }

// const mkDefineEndpoint = () => {
//   return <
//     TMethod extends Method,
//     Api,
//     TModule extends string,
//     TEntity extends string,
//     TName extends string,
//     Fields extends Array<string>,
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
//       Fields,
//       Includes,
//       QueryableSpecial,
//       IsCollection
//     >,
//   ) =>
//     defineEndpoint<
//       TMethod,
//       Api,
//       TModule,
//       TEntity,
//       TName,
//       Fields,
//       Includes,
//       QueryableSpecial,
//       IsCollection
//     >(params)
// }

// type PCOApiBase = {
//   readonly type: string
//   readonly attributes: Record<string, any>
//   readonly id: string
//   readonly links: Record<string, any>
//   readonly relationships: Record<string, any>
// }

// const pcoApiAdapter = mkDefineEndpoint()

// const getAllPeopleDefinition = pcoApiAdapter({
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
//       'foo',
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
