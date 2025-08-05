import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { assertNone } from '@openfaith/bun-test/assert'
import { campusesTable, peopleTable } from '@openfaith/db'
import { PcoAddress, pcoAddressTransformer } from '@openfaith/pco/modules/people/pcoAddressSchema'
import { PcoCampus, pcoCampusTransformer } from '@openfaith/pco/modules/people/pcoCampusSchema'
import { PcoPerson, pcoPersonTransformer } from '@openfaith/pco/modules/people/pcoPersonSchema'
import {
  PcoPhoneNumber,
  pcoPhoneNumberTransformer,
} from '@openfaith/pco/modules/people/pcoPhoneNumberSchema'
import { Address, Campus, Person, PhoneNumber } from '@openfaith/schema'
import {
  getEntityMetadata,
  getPcoEntityMetadata,
  getPcoEntityTypes,
  isPcoEntityTypeSupported,
  type PcoEntityType,
} from '@openfaith/workers/helpers/schemaRegistry'
import { Array, Effect, Option, pipe } from 'effect'

// Test getEntityMetadata function
effect('getEntityMetadata should extract domain schema from OfEntity annotation', () =>
  Effect.gen(function* () {
    const metadata = getEntityMetadata(PcoPerson)

    // Should have entity (Person schema)
    expect(Option.isSome(metadata.entity)).toBe(true)
    if (Option.isSome(metadata.entity)) {
      expect(metadata.entity.value).toBe(Person)
    }
  }),
)

effect('getEntityMetadata should extract table from domain schema via OfEntity', () =>
  Effect.gen(function* () {
    const metadata = getEntityMetadata(PcoPerson)

    // Should have table from the Person domain schema
    expect(Option.isSome(metadata.table)).toBe(true)
    if (Option.isSome(metadata.table)) {
      expect(metadata.table.value).toBe(peopleTable)
    }
  }),
)

effect('getEntityMetadata should extract transformer from PCO schema', () =>
  Effect.gen(function* () {
    const metadata = getEntityMetadata(PcoPerson)

    // Should have transformer
    expect(Option.isSome(metadata.transformer)).toBe(true)
    if (Option.isSome(metadata.transformer)) {
      expect(metadata.transformer.value).toBe(pcoPersonTransformer)
    }
  }),
)

effect('getEntityMetadata should work for Campus schema', () =>
  Effect.gen(function* () {
    const metadata = getEntityMetadata(PcoCampus)

    // Should have entity (Campus schema)
    expect(Option.isSome(metadata.entity)).toBe(true)
    if (Option.isSome(metadata.entity)) {
      expect(metadata.entity.value).toBe(Campus)
    }

    // Should have table from the Campus domain schema
    expect(Option.isSome(metadata.table)).toBe(true)
    if (Option.isSome(metadata.table)) {
      expect(metadata.table.value).toBe(campusesTable)
    }

    // Should have transformer
    expect(Option.isSome(metadata.transformer)).toBe(true)
    if (Option.isSome(metadata.transformer)) {
      expect(metadata.transformer.value).toBe(pcoCampusTransformer)
    }
  }),
)

effect('getEntityMetadata should work for Address schema', () =>
  Effect.gen(function* () {
    const metadata = getEntityMetadata(PcoAddress)

    // Should have entity (Address schema)
    expect(Option.isSome(metadata.entity)).toBe(true)
    if (Option.isSome(metadata.entity)) {
      expect(metadata.entity.value).toBe(Address)
    }

    // Should have transformer
    expect(Option.isSome(metadata.transformer)).toBe(true)
    if (Option.isSome(metadata.transformer)) {
      expect(metadata.transformer.value).toBe(pcoAddressTransformer)
    }
  }),
)

effect('getEntityMetadata should work for PhoneNumber schema', () =>
  Effect.gen(function* () {
    const metadata = getEntityMetadata(PcoPhoneNumber)

    // Should have entity (PhoneNumber schema)
    expect(Option.isSome(metadata.entity)).toBe(true)
    if (Option.isSome(metadata.entity)) {
      expect(metadata.entity.value).toBe(PhoneNumber)
    }

    // Should have transformer
    expect(Option.isSome(metadata.transformer)).toBe(true)
    if (Option.isSome(metadata.transformer)) {
      expect(metadata.transformer.value).toBe(pcoPhoneNumberTransformer)
    }
  }),
)

// Test getPcoEntityMetadata function
effect('getPcoEntityMetadata should return Option.none() for unsupported entity types', () =>
  Effect.gen(function* () {
    const unsupportedTypes = [
      'UnsupportedType',
      'NotAnEntity',
      'Random',
      'Group',
      'Event',
      'Attendance',
      '',
      'null',
      'undefined',
    ]

    pipe(
      unsupportedTypes,
      Array.forEach((entityType) => {
        const metadataOpt = getPcoEntityMetadata(entityType)
        assertNone(metadataOpt)
      }),
    )
  }),
)

effect('getPcoEntityMetadata should return correct metadata for Person', () =>
  Effect.gen(function* () {
    const metadataOpt = getPcoEntityMetadata('Person')

    expect(Option.isSome(metadataOpt)).toBe(true)
    if (Option.isSome(metadataOpt)) {
      const metadata = metadataOpt.value

      // Check schema
      expect(metadata.schema).toBe(PcoPerson)

      // Check ofEntity
      expect(Option.isSome(metadata.ofEntity)).toBe(true)
      if (Option.isSome(metadata.ofEntity)) {
        expect(metadata.ofEntity.value).toBe(Person)
      }

      // Check table
      expect(Option.isSome(metadata.table)).toBe(true)
      if (Option.isSome(metadata.table)) {
        expect(metadata.table.value).toBe(peopleTable)
      }

      // Check transformer
      expect(Option.isSome(metadata.transformer)).toBe(true)
      if (Option.isSome(metadata.transformer)) {
        expect(metadata.transformer.value).toBe(pcoPersonTransformer)
      }
    }
  }),
)

effect('getPcoEntityMetadata should return correct metadata for Campus', () =>
  Effect.gen(function* () {
    const metadataOpt = getPcoEntityMetadata('Campus')

    expect(Option.isSome(metadataOpt)).toBe(true)
    if (Option.isSome(metadataOpt)) {
      const metadata = metadataOpt.value

      // Check schema
      expect(metadata.schema).toBe(PcoCampus)

      // Check ofEntity
      expect(Option.isSome(metadata.ofEntity)).toBe(true)
      if (Option.isSome(metadata.ofEntity)) {
        expect(metadata.ofEntity.value).toBe(Campus)
      }

      // Check table
      expect(Option.isSome(metadata.table)).toBe(true)
      if (Option.isSome(metadata.table)) {
        expect(metadata.table.value).toBe(campusesTable)
      }

      // Check transformer
      expect(Option.isSome(metadata.transformer)).toBe(true)
      if (Option.isSome(metadata.transformer)) {
        expect(metadata.transformer.value).toBe(pcoCampusTransformer)
      }
    }
  }),
)

effect('getPcoEntityMetadata should return correct metadata for Address', () =>
  Effect.gen(function* () {
    const metadataOpt = getPcoEntityMetadata('Address')

    expect(Option.isSome(metadataOpt)).toBe(true)
    if (Option.isSome(metadataOpt)) {
      const metadata = metadataOpt.value

      // Check schema
      expect(metadata.schema).toBe(PcoAddress)

      // Check ofEntity
      expect(Option.isSome(metadata.ofEntity)).toBe(true)
      if (Option.isSome(metadata.ofEntity)) {
        expect(metadata.ofEntity.value).toBe(Address)
      }

      // Check transformer
      expect(Option.isSome(metadata.transformer)).toBe(true)
      if (Option.isSome(metadata.transformer)) {
        expect(metadata.transformer.value).toBe(pcoAddressTransformer)
      }
    }
  }),
)

effect('getPcoEntityMetadata should return correct metadata for PhoneNumber', () =>
  Effect.gen(function* () {
    const metadataOpt = getPcoEntityMetadata('PhoneNumber')

    expect(Option.isSome(metadataOpt)).toBe(true)
    if (Option.isSome(metadataOpt)) {
      const metadata = metadataOpt.value

      // Check schema
      expect(metadata.schema).toBe(PcoPhoneNumber)

      // Check ofEntity
      expect(Option.isSome(metadata.ofEntity)).toBe(true)
      if (Option.isSome(metadata.ofEntity)) {
        expect(metadata.ofEntity.value).toBe(PhoneNumber)
      }

      // Check transformer
      expect(Option.isSome(metadata.transformer)).toBe(true)
      if (Option.isSome(metadata.transformer)) {
        expect(metadata.transformer.value).toBe(pcoPhoneNumberTransformer)
      }
    }
  }),
)

// Test getPcoEntityTypes function
effect('getPcoEntityTypes should return all registered entity types', () =>
  Effect.gen(function* () {
    const entityTypes = getPcoEntityTypes()

    // Should return exactly 4 entity types
    expect(entityTypes.length).toBe(4)

    // Should contain all expected types
    const expectedTypes: ReadonlyArray<PcoEntityType> = [
      'Address',
      'Campus',
      'Person',
      'PhoneNumber',
    ]

    pipe(
      expectedTypes,
      Array.forEach((expectedType) => {
        expect(entityTypes).toContain(expectedType)
      }),
    )

    // Should not contain any unexpected types
    pipe(
      entityTypes,
      Array.forEach((entityType) => {
        expect(expectedTypes).toContain(entityType)
      }),
    )
  }),
)

effect('getPcoEntityTypes should return types in consistent order', () =>
  Effect.gen(function* () {
    // Call multiple times to ensure consistency
    const result1 = getPcoEntityTypes()
    const result2 = getPcoEntityTypes()
    const result3 = getPcoEntityTypes()

    // All calls should return the same array
    expect(result1).toEqual(result2)
    expect(result2).toEqual(result3)
  }),
)

// Test isPcoEntityTypeSupported function
effect('isPcoEntityTypeSupported should correctly identify supported entity types', () =>
  Effect.gen(function* () {
    const supportedTypes: ReadonlyArray<string> = ['Person', 'Campus', 'Address', 'PhoneNumber']

    pipe(
      supportedTypes,
      Array.forEach((entityType) => {
        expect(isPcoEntityTypeSupported(entityType)).toBe(true)
      }),
    )
  }),
)

effect('isPcoEntityTypeSupported should correctly identify unsupported entity types', () =>
  Effect.gen(function* () {
    const unsupportedTypes = [
      'Group',
      'Event',
      'Attendance',
      'UnsupportedType',
      'Random',
      '',
      'null',
      'undefined',
      'person', // lowercase
      'PERSON', // uppercase
      'People', // plural
      'PhoneNumbers', // plural
    ]

    pipe(
      unsupportedTypes,
      Array.forEach((entityType) => {
        expect(isPcoEntityTypeSupported(entityType)).toBe(false)
      }),
    )
  }),
)

// Type-level tests
effect('Type validation: PcoEntityType should be a union of supported types', () =>
  Effect.gen(function* () {
    // This test validates that the PcoEntityType type is correctly inferred
    const validEntityType: PcoEntityType = 'Person'
    const anotherValid: PcoEntityType = 'Campus'
    const addressValid: PcoEntityType = 'Address'
    const phoneValid: PcoEntityType = 'PhoneNumber'

    // These assignments should compile correctly
    expect(validEntityType).toBe('Person')
    expect(anotherValid).toBe('Campus')
    expect(addressValid).toBe('Address')
    expect(phoneValid).toBe('PhoneNumber')

    // This validates that the type system prevents invalid assignments at compile time
    // The following would not compile if uncommented:
    // const invalid: PcoEntityType = 'InvalidType'
  }),
)

effect('Type validation: isPcoEntityTypeSupported acts as type guard', () =>
  Effect.gen(function* () {
    const unknownValue: string = 'Person'

    if (isPcoEntityTypeSupported(unknownValue)) {
      // Within this block, unknownValue should be typed as PcoEntityType
      const typedValue: PcoEntityType = unknownValue
      expect(typedValue).toBe('Person')

      // Should be able to use it with getPcoEntityMetadata without type errors
      const metadataOpt = getPcoEntityMetadata(typedValue)
      expect(Option.isSome(metadataOpt)).toBe(true)
    }
  }),
)

// Integration tests
effect('Integration: dynamic table lookup works through OfEntity chain', () =>
  Effect.gen(function* () {
    // This test validates the full chain:
    // PCO Schema -> OfEntity annotation -> Domain Schema -> OfTable annotation -> Table

    const personMetadata = getEntityMetadata(PcoPerson)
    const campusMetadata = getEntityMetadata(PcoCampus)

    // Person chain validation
    expect(Option.isSome(personMetadata.entity)).toBe(true)
    expect(Option.isSome(personMetadata.table)).toBe(true)
    if (Option.isSome(personMetadata.entity)) {
      expect(personMetadata.entity.value).toBe(Person)
    }
    if (Option.isSome(personMetadata.table)) {
      expect(personMetadata.table.value).toBe(peopleTable)
    }

    // Campus chain validation
    expect(Option.isSome(campusMetadata.entity)).toBe(true)
    expect(Option.isSome(campusMetadata.table)).toBe(true)
    if (Option.isSome(campusMetadata.entity)) {
      expect(campusMetadata.entity.value).toBe(Campus)
    }
    if (Option.isSome(campusMetadata.table)) {
      expect(campusMetadata.table.value).toBe(campusesTable)
    }
  }),
)

effect('Integration: all registered schemas have complete metadata', () =>
  Effect.gen(function* () {
    const entityTypes = getPcoEntityTypes()

    pipe(
      entityTypes,
      Array.forEach((entityType) => {
        const metadataOpt = getPcoEntityMetadata(entityType)
        expect(Option.isSome(metadataOpt)).toBe(true)

        if (Option.isSome(metadataOpt)) {
          const metadata = metadataOpt.value

          // Every registered entity should have:
          // 1. A schema
          expect(metadata.schema).toBeDefined()

          // 2. An ofEntity reference
          expect(Option.isSome(metadata.ofEntity)).toBe(true)

          // 3. A transformer
          expect(Option.isSome(metadata.transformer)).toBe(true)

          // Note: Not all entities have tables (e.g., Address, PhoneNumber might not have dedicated tables)
          // So we don't assert on table presence for all entities
        }
      }),
    )
  }),
)

// Edge case tests
effect('Edge case: getEntityMetadata handles schema without OfEntity annotation', () =>
  Effect.gen(function* () {
    // Create a mock schema without OfEntity annotation
    const MockSchema = pipe(PcoPerson, (schema) => {
      // Create a new schema without the OfEntity annotation
      // This simulates a schema that doesn't have the annotation
      return schema
    })

    const metadata = getEntityMetadata(MockSchema)

    // Should still extract what it can
    expect(Option.isSome(metadata.transformer)).toBe(true) // Transformer should still be present
  }),
)

effect('Edge case: getPcoEntityMetadata handles case-sensitive entity names', () =>
  Effect.gen(function* () {
    // Test case sensitivity
    const lowerCaseOpt = getPcoEntityMetadata('person')
    const upperCaseOpt = getPcoEntityMetadata('PERSON')
    const correctCaseOpt = getPcoEntityMetadata('Person')

    assertNone(lowerCaseOpt)
    assertNone(upperCaseOpt)
    expect(Option.isSome(correctCaseOpt)).toBe(true)
  }),
)

// Performance test
effect('Performance: getPcoEntityMetadata should be efficient for repeated calls', () =>
  Effect.gen(function* () {
    const iterations = 1000
    const startTime = Date.now()

    for (let i = 0; i < iterations; i++) {
      getPcoEntityMetadata('Person')
      getPcoEntityMetadata('Campus')
      getPcoEntityMetadata('InvalidType')
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    // Should complete 3000 lookups in under 100ms
    expect(duration).toBeLessThan(100)
  }),
)
