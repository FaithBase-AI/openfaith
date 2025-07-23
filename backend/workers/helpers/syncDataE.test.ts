import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { type CrudOperation, mkEntityName } from '@openfaith/workers/helpers/syncDataE'
import { Effect } from 'effect'

// ===== UNIT TESTS FOR INDIVIDUAL FUNCTIONS =====

effect('mkEntityName converts table names correctly', () =>
  Effect.gen(function* () {
    expect(mkEntityName('people')).toBe('Person')
    expect(mkEntityName('addresses')).toBe('Address')
    expect(mkEntityName('phone_numbers')).toBe('PhoneNumber')
    expect(mkEntityName('campuses')).toBe('Campus')
    expect(mkEntityName('custom_entities')).toBe('CustomEntity')
  }),
)

// Test data factory
const createCrudOperation = (
  op: CrudOperation['op'] = 'insert',
  tableName = 'people',
  entityId = 'person_123',
  value: any = {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
  },
): CrudOperation => ({
  op,
  primaryKey: { id: entityId },
  tableName,
  value,
})

effect('CrudOperation factory creates valid operations', () =>
  Effect.gen(function* () {
    const operation = createCrudOperation('update', 'people', 'person_123')

    expect(operation.op).toBe('update')
    expect(operation.tableName).toBe('people')
    expect(operation.primaryKey.id).toBe('person_123')
    expect(operation.value).toBeDefined()
  }),
)

effect('CrudOperation factory handles different operation types', () =>
  Effect.gen(function* () {
    const insertOp = createCrudOperation('insert')
    const updateOp = createCrudOperation('update')
    const deleteOp = createCrudOperation('delete')
    const upsertOp = createCrudOperation('upsert')

    expect(insertOp.op).toBe('insert')
    expect(updateOp.op).toBe('update')
    expect(deleteOp.op).toBe('delete')
    expect(upsertOp.op).toBe('upsert')
  }),
)

effect('mkEntityName handles edge cases', () =>
  Effect.gen(function* () {
    // Test various pluralization patterns
    expect(mkEntityName('companies')).toBe('Company') // -ies -> -y
    expect(mkEntityName('boxes')).toBe('Box') // -es -> remove
    expect(mkEntityName('children')).toBe('Child') // irregular
    expect(mkEntityName('data')).toBe('Data') // no change needed

    // Test snake_case conversion
    expect(mkEntityName('phone_numbers')).toBe('PhoneNumber')
    expect(mkEntityName('email_addresses')).toBe('EmailAddress')
    expect(mkEntityName('user_profiles')).toBe('UserProfile')
  }),
)

// Basic integration test without database dependencies
effect('syncDataE types are properly exported', () =>
  Effect.gen(function* () {
    // This test verifies that our types and functions are properly exported
    // and can be imported without compilation errors

    const operation: CrudOperation = {
      op: 'insert',
      primaryKey: { id: 'test_123' },
      tableName: 'people',
      value: { name: 'Test User' },
    }

    expect(operation.op).toBe('insert')
    expect(typeof mkEntityName).toBe('function')
  }),
)
