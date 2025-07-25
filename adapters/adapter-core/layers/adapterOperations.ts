import type {
  AdapterConnectionError,
  AdapterSyncError,
  AdapterTokenError,
  AdapterValidationError,
} from '@openfaith/adapter-core/errors/adapterErrors'
import type { CRUDOp } from '@openfaith/domain'
import { Context, type Effect, type Option, Schema, type Stream } from 'effect'

export const TokenResponse = Schema.Struct({
  accessToken: Schema.String,
  createdAt: Schema.Number,
  expiresIn: Schema.Number,
  refreshToken: Schema.String,
  tokenType: Schema.String,
})
export type TokenResponse = typeof TokenResponse.Type

export const AdapterEntityManifest = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    endpoint: Schema.String,
    endpoints: Schema.Record({
      key: Schema.String,
      value: Schema.Unknown,
    }),
    entity: Schema.String,
    skipSync: Schema.Boolean,
    transformer: Schema.optional(Schema.Unknown),
  }),
})
export type AdapterEntityManifest = typeof AdapterEntityManifest.Type

export const SyncResult = Schema.Struct({
  entityName: Schema.String,
  error: Schema.optional(Schema.String),
  externalId: Schema.String,
  operation: Schema.String,
  success: Schema.Boolean,
})
export type SyncResult = typeof SyncResult.Type

export class AdapterOperations extends Context.Tag('@openfaith/adapter-core/AdapterOperations')<
  AdapterOperations,
  {
    readonly fetchToken: (params: {
      code: string
      redirectUri: string
    }) => Effect.Effect<
      TokenResponse,
      AdapterTokenError | AdapterConnectionError | AdapterValidationError
    >

    readonly extractUpdatedAt: (response: unknown) => Option.Option<string>

    readonly syncEntityData: (
      entityName: string,
      operations: ReadonlyArray<CRUDOp>,
    ) => Effect.Effect<ReadonlyArray<SyncResult>, AdapterSyncError | AdapterValidationError>

    readonly listEntityData: (
      entityName: string,
      params?: Record<string, unknown>,
    ) => Stream.Stream<unknown, AdapterSyncError | AdapterConnectionError>

    readonly processEntityData: <R, E>(
      entityName: string,
      processor: (data: unknown) => Effect.Effect<void, E, R>,
    ) => Effect.Effect<void, AdapterSyncError | AdapterConnectionError | E, R>

    readonly getEntityManifest: () => AdapterEntityManifest

    readonly transformEntityData: (
      entityName: string,
      data: unknown,
      operation: 'create' | 'update' | 'delete',
    ) => Effect.Effect<unknown, AdapterValidationError>

    readonly getAdapterTag: () => string
  }
>() {}
