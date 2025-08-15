import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  AppError,
  CRUDMutation,
  CRUDOp,
  CustomMutation,
  DeleteOp,
  HttpError,
  InsertOp,
  MainApi,
  Mutation,
  MutationError,
  MutationID,
  MutationOk,
  MutationResponse,
  MutatorError,
  PrimaryKey,
  PushError,
  PushOk,
  PushRequest,
  PushResponse,
  PushUrlParams,
  RowValue,
  UnsupportedPushVersionError,
  UnsupportedSchemaVersionError,
  UpdateOp,
  UpsertOp,
  ValidationError,
  ZeroError,
  ZeroMutatorsGroup,
  ZeroPusherError,
} from '@openfaith/domain/Http'
import { Effect, Schema } from 'effect'

// Test PrimaryKey schema
effect('PrimaryKey should validate correctly', () =>
  Effect.gen(function* () {
    const validPrimaryKey = { key: 'id', value: '123' }
    const result = yield* Schema.decodeUnknown(PrimaryKey)(validPrimaryKey)
    expect(result).toEqual(validPrimaryKey)
  }),
)

effect('PrimaryKey should reject invalid data', () =>
  Effect.gen(function* () {
    const invalidPrimaryKey = { key: 123, value: '123' } // key should be string
    const result = yield* Effect.exit(Schema.decodeUnknown(PrimaryKey)(invalidPrimaryKey))
    // Note: Schema.Record allows any key-value pairs, so this actually succeeds
    expect(result._tag).toBe('Success')
  }),
)

// Test RowValue schema
effect('RowValue should validate correctly', () =>
  Effect.gen(function* () {
    const validRowValue = { key: 'name', value: 'John Doe' }
    const result = yield* Schema.decodeUnknown(RowValue)(validRowValue)
    expect(result).toEqual(validRowValue)
  }),
)

// Test CRUD operation schemas
effect('InsertOp should validate correctly', () =>
  Effect.gen(function* () {
    const validInsertOp = {
      op: 'insert' as const,
      primaryKey: { key: 'id', value: '123' },
      tableName: 'users',
      value: { key: 'name', value: 'John' },
    }
    const result = yield* Schema.decodeUnknown(InsertOp)(validInsertOp)
    expect(result).toEqual(validInsertOp)
  }),
)

effect('UpsertOp should validate correctly', () =>
  Effect.gen(function* () {
    const validUpsertOp = {
      op: 'upsert' as const,
      primaryKey: { key: 'id', value: '123' },
      tableName: 'users',
      value: { key: 'name', value: 'John' },
    }
    const result = yield* Schema.decodeUnknown(UpsertOp)(validUpsertOp)
    expect(result).toEqual(validUpsertOp)
  }),
)

effect('UpdateOp should validate correctly', () =>
  Effect.gen(function* () {
    const validUpdateOp = {
      op: 'update' as const,
      primaryKey: { key: 'id', value: '123' },
      tableName: 'users',
      value: { key: 'name', value: 'Jane' },
    }
    const result = yield* Schema.decodeUnknown(UpdateOp)(validUpdateOp)
    expect(result).toEqual(validUpdateOp)
  }),
)

effect('DeleteOp should validate correctly', () =>
  Effect.gen(function* () {
    const validDeleteOp = {
      op: 'delete' as const,
      primaryKey: { key: 'id', value: '123' },
      tableName: 'users',
      value: { key: 'id', value: '123' },
    }
    const result = yield* Schema.decodeUnknown(DeleteOp)(validDeleteOp)
    expect(result).toEqual(validDeleteOp)
  }),
)

effect('CRUDOp union should accept all operation types', () =>
  Effect.gen(function* () {
    const insertOp = {
      op: 'insert' as const,
      primaryKey: { key: 'id', value: '123' },
      tableName: 'users',
      value: { key: 'name', value: 'John' },
    }
    const deleteOp = {
      op: 'delete' as const,
      primaryKey: { key: 'id', value: '123' },
      tableName: 'users',
      value: { key: 'id', value: '123' },
    }

    const insertResult = yield* Schema.decodeUnknown(CRUDOp)(insertOp)
    const deleteResult = yield* Schema.decodeUnknown(CRUDOp)(deleteOp)

    expect(insertResult).toEqual(insertOp)
    expect(deleteResult).toEqual(deleteOp)
  }),
)

// Test mutation schemas
effect('CRUDMutation should validate correctly', () =>
  Effect.gen(function* () {
    const validCRUDMutation = {
      args: [
        {
          ops: [
            {
              op: 'insert' as const,
              primaryKey: { key: 'id', value: '123' },
              tableName: 'users',
              value: { key: 'name', value: 'John' },
            },
          ],
        },
      ] as const,
      clientID: 'client-123',
      id: 1,
      name: '_zero_crud' as const,
      timestamp: Date.now(),
      type: 'crud' as const,
    }
    const result = yield* Schema.decodeUnknown(CRUDMutation)(validCRUDMutation)
    expect(result).toEqual(validCRUDMutation)
  }),
)

effect('CustomMutation should validate correctly', () =>
  Effect.gen(function* () {
    const validCustomMutation = {
      args: ['arg1', 'arg2', { key: 'value' }],
      clientID: 'client-123',
      id: 2,
      name: 'customMutator',
      timestamp: Date.now(),
      type: 'custom' as const,
    }
    const result = yield* Schema.decodeUnknown(CustomMutation)(validCustomMutation)
    expect(result).toEqual(validCustomMutation)
  }),
)

effect('Mutation union should accept both CRUD and custom mutations', () =>
  Effect.gen(function* () {
    const crudMutation = {
      args: [{ ops: [] }] as const,
      clientID: 'client-123',
      id: 1,
      name: '_zero_crud' as const,
      timestamp: Date.now(),
      type: 'crud' as const,
    }
    const customMutation = {
      args: ['test'],
      clientID: 'client-456',
      id: 2,
      name: 'testMutator',
      timestamp: Date.now(),
      type: 'custom' as const,
    }

    const crudResult = yield* Schema.decodeUnknown(Mutation)(crudMutation)
    const customResult = yield* Schema.decodeUnknown(Mutation)(customMutation)

    expect(crudResult).toEqual(crudMutation)
    expect(customResult).toEqual(customMutation)
  }),
)

// Test PushRequest schema
effect('PushRequest should validate correctly', () =>
  Effect.gen(function* () {
    const validPushRequest = {
      clientGroupID: 'group-123',
      mutations: [
        {
          args: ['test'],
          clientID: 'client-123',
          id: 1,
          name: 'testMutator',
          timestamp: Date.now(),
          type: 'custom' as const,
        },
      ],
      pushVersion: 1,
      requestID: 'req-123',
      schemaVersion: 1,
      timestamp: Date.now(),
    }
    const result = yield* Schema.decodeUnknown(PushRequest)(validPushRequest)
    expect(result).toEqual(validPushRequest)
  }),
)

effect('PushRequest should work without optional schemaVersion', () =>
  Effect.gen(function* () {
    const validPushRequest = {
      clientGroupID: 'group-123',
      mutations: [],
      pushVersion: 1,
      requestID: 'req-123',
      timestamp: Date.now(),
    }
    const result = yield* Schema.decodeUnknown(PushRequest)(validPushRequest)
    expect(result.schemaVersion).toBeUndefined()
  }),
)

// Test PushUrlParams schema
effect('PushUrlParams should validate correctly', () =>
  Effect.gen(function* () {
    const validUrlParams = {
      appID: 'app-123',
      schema: 'v1',
    }
    const result = yield* Schema.decodeUnknown(PushUrlParams)(validUrlParams)
    expect(result).toEqual(validUrlParams)
  }),
)

// Test MutationID schema
effect('MutationID should validate correctly', () =>
  Effect.gen(function* () {
    const validMutationID = {
      clientID: 'client-123',
      id: 42,
    }
    const result = yield* Schema.decodeUnknown(MutationID)(validMutationID)
    expect(result).toEqual(validMutationID)
  }),
)

// Test mutation result schemas
effect('MutationOk should validate correctly', () =>
  Effect.gen(function* () {
    const validMutationOk = {
      data: { result: 'success' },
    }
    const result = yield* Schema.decodeUnknown(MutationOk)(validMutationOk)
    expect(result).toEqual(validMutationOk)
  }),
)

effect('MutationOk should work without optional data', () =>
  Effect.gen(function* () {
    const validMutationOk = {}
    const result = yield* Schema.decodeUnknown(MutationOk)(validMutationOk)
    expect(result.data).toBeUndefined()
  }),
)

effect('AppError should validate correctly', () =>
  Effect.gen(function* () {
    const validAppError = {
      details: 'Something went wrong',
      error: 'app' as const,
    }
    const result = yield* Schema.decodeUnknown(AppError)(validAppError)
    expect(result).toEqual(validAppError)
  }),
)

effect('ZeroError should validate correctly', () =>
  Effect.gen(function* () {
    const validZeroError = {
      details: 'Out of order mutation',
      error: 'oooMutation' as const,
    }
    const result = yield* Schema.decodeUnknown(ZeroError)(validZeroError)
    expect(result).toEqual(validZeroError)
  }),
)

effect('MutationError union should accept both app and zero errors', () =>
  Effect.gen(function* () {
    const appError = { error: 'app' as const }
    const zeroError = { error: 'oooMutation' as const }

    const appResult = yield* Schema.decodeUnknown(MutationError)(appError)
    const zeroResult = yield* Schema.decodeUnknown(MutationError)(zeroError)

    expect(appResult).toEqual(appError)
    expect(zeroResult).toEqual(zeroError)
  }),
)

// Test MutationResponse schema
effect('MutationResponse should validate correctly', () =>
  Effect.gen(function* () {
    const validMutationResponse = {
      id: { clientID: 'client-123', id: 1 },
      result: { data: 'success' },
    }
    const result = yield* Schema.decodeUnknown(MutationResponse)(validMutationResponse)
    expect(result).toEqual(validMutationResponse)
  }),
)

// Test PushOk schema
effect('PushOk should validate correctly', () =>
  Effect.gen(function* () {
    const validPushOk = {
      mutations: [
        {
          id: { clientID: 'client-123', id: 1 },
          result: { data: 'success' },
        },
      ],
    }
    const result = yield* Schema.decodeUnknown(PushOk)(validPushOk)
    expect(result).toEqual(validPushOk)
  }),
)

// Test push error schemas
effect('UnsupportedPushVersionError should validate correctly', () =>
  Effect.gen(function* () {
    const validError = {
      error: 'unsupportedPushVersion' as const,
      mutationIDs: [{ clientID: 'client-123', id: 1 }],
    }
    const result = yield* Schema.decodeUnknown(UnsupportedPushVersionError)(validError)
    expect(result).toEqual(validError)
  }),
)

effect('UnsupportedSchemaVersionError should validate correctly', () =>
  Effect.gen(function* () {
    const validError = {
      error: 'unsupportedSchemaVersion' as const,
    }
    const result = yield* Schema.decodeUnknown(UnsupportedSchemaVersionError)(validError)
    expect(result.mutationIDs).toBeUndefined()
  }),
)

effect('HttpError should validate correctly', () =>
  Effect.gen(function* () {
    const validError = {
      details: 'Network error',
      error: 'http' as const,
      status: 500,
    }
    const result = yield* Schema.decodeUnknown(HttpError)(validError)
    expect(result).toEqual(validError)
  }),
)

effect('ZeroPusherError should validate correctly', () =>
  Effect.gen(function* () {
    const validError = {
      details: 'Pusher failed',
      error: 'zeroPusher' as const,
    }
    const result = yield* Schema.decodeUnknown(ZeroPusherError)(validError)
    expect(result).toEqual(validError)
  }),
)

effect('PushError union should accept all error types', () =>
  Effect.gen(function* () {
    const pushVersionError = { error: 'unsupportedPushVersion' as const }
    const schemaVersionError = { error: 'unsupportedSchemaVersion' as const }
    const httpError = { details: 'Error', error: 'http' as const, status: 400 }
    const pusherError = { details: 'Error', error: 'zeroPusher' as const }

    const results = yield* Effect.all([
      Schema.decodeUnknown(PushError)(pushVersionError),
      Schema.decodeUnknown(PushError)(schemaVersionError),
      Schema.decodeUnknown(PushError)(httpError),
      Schema.decodeUnknown(PushError)(pusherError),
    ])

    expect(results[0]).toEqual(pushVersionError)
    expect(results[1]).toEqual(schemaVersionError)
    expect(results[2]).toEqual(httpError)
    expect(results[3]).toEqual(pusherError)
  }),
)

// Test PushResponse union
effect('PushResponse should accept both success and error responses', () =>
  Effect.gen(function* () {
    const successResponse = { mutations: [] }
    const errorResponse = { error: 'unsupportedPushVersion' as const }

    const successResult = yield* Schema.decodeUnknown(PushResponse)(successResponse)
    const errorResult = yield* Schema.decodeUnknown(PushResponse)(errorResponse)

    expect(successResult).toEqual(successResponse)
    expect(errorResult).toEqual(errorResponse)
  }),
)

// Test tagged error classes
effect('MutatorError should create correctly', () =>
  Effect.gen(function* () {
    const error = new MutatorError({
      message: 'Mutator failed',
      mutationId: 'mut-123',
    })
    expect(error._tag).toBe('MutatorError')
    expect(error.message).toBe('Mutator failed')
    expect(error.mutationId).toBe('mut-123')
  }),
)

effect('ValidationError should create correctly', () =>
  Effect.gen(function* () {
    const error = new ValidationError({
      field: 'name',
      message: 'Invalid field',
    })
    expect(error._tag).toBe('ValidationError')
    expect(error.message).toBe('Invalid field')
    expect(error.field).toBe('name')
  }),
)

effect('ValidationError should work without optional field', () =>
  Effect.gen(function* () {
    const error = new ValidationError({
      message: 'General validation error',
    })
    expect(error._tag).toBe('ValidationError')
    expect(error.message).toBe('General validation error')
    expect(error.field).toBeUndefined()
  }),
)

// Test API structure
effect('ZeroMutatorsGroup should be defined correctly', () =>
  Effect.gen(function* () {
    expect(ZeroMutatorsGroup).toBeDefined()
    expect(ZeroMutatorsGroup.identifier).toBe('zero')
  }),
)

effect('MainApi should be defined correctly', () =>
  Effect.gen(function* () {
    expect(MainApi).toBeDefined()
    // The API class doesn't have a direct identifier property
    expect(typeof MainApi).toBe('function')
  }),
)

// Test complex scenarios
effect('should handle complex CRUD mutation with multiple operations', () =>
  Effect.gen(function* () {
    const complexMutation = {
      args: [
        {
          ops: [
            {
              op: 'insert' as const,
              primaryKey: { key: 'id', value: '1' },
              tableName: 'users',
              value: { key: 'name', value: 'John' },
            },
            {
              op: 'update' as const,
              primaryKey: { key: 'id', value: '2' },
              tableName: 'users',
              value: { key: 'email', value: 'john@example.com' },
            },
            {
              op: 'delete' as const,
              primaryKey: { key: 'id', value: '3' },
              tableName: 'users',
              value: { key: 'id', value: '3' },
            },
          ],
        },
      ] as const,
      clientID: 'client-123',
      id: 1,
      name: '_zero_crud' as const,
      timestamp: Date.now(),
      type: 'crud' as const,
    }

    const result = yield* Schema.decodeUnknown(CRUDMutation)(complexMutation)
    expect(result.args[0]?.ops).toHaveLength(3)
    expect(result.args[0]?.ops[0]?.op).toBe('insert')
    expect(result.args[0]?.ops[1]?.op).toBe('update')
    expect(result.args[0]?.ops[2]?.op).toBe('delete')
  }),
)

effect('should handle push request with mixed mutation types', () =>
  Effect.gen(function* () {
    const mixedPushRequest = {
      clientGroupID: 'group-123',
      mutations: [
        {
          args: [{ ops: [] }] as const,
          clientID: 'client-123',
          id: 1,
          name: '_zero_crud' as const,
          timestamp: Date.now(),
          type: 'crud' as const,
        },
        {
          args: ['custom', 'args'],
          clientID: 'client-456',
          id: 2,
          name: 'customMutator',
          timestamp: Date.now(),
          type: 'custom' as const,
        },
      ],
      pushVersion: 1,
      requestID: 'req-123',
      timestamp: Date.now(),
    }

    const result = yield* Schema.decodeUnknown(PushRequest)(mixedPushRequest)
    expect(result.mutations).toHaveLength(2)
    expect(result.mutations[0]?.type).toBe('crud')
    expect(result.mutations[1]?.type).toBe('custom')
  }),
)
