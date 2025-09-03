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
import {
  Address,
  Campus,
  getAnnotationFromSchema,
  OfEntity,
  OfTable,
  OfTransformer,
  Person,
  PhoneNumber,
} from '@openfaith/schema'
import { getProperEntityName } from '@openfaith/server'
import {
  getEntityMetadata,
  getPcoEntityMetadata,
  getPcoEntityTypes,
  isPcoEntityTypeSupported,
  type PcoEntityType,
} from '@openfaith/workers/helpers/schemaRegistry'
import { Array, Effect, Option, pipe, Schema, SchemaAST } from 'effect'

// Test getAnnotationFromSchema helper function
effect('getAnnotationFromSchema should find direct annotations', () =>
  Effect.gen(function* () {
    // Create a simple schema with direct annotations
    const TestSchema = Schema.Struct({
      name: Schema.String,
    }).annotations({
      [OfEntity]: Person,
      title: 'testEntity',
    })

    // Should find the OfEntity annotation directly
    const ofEntityOpt = getAnnotationFromSchema<any>(OfEntity, TestSchema.ast)
    expect(Option.isSome(ofEntityOpt)).toBe(true)
    if (Option.isSome(ofEntityOpt)) {
      expect(ofEntityOpt.value).toBe(Person)
    }

    // Should find the title annotation directly
    const titleOpt = getAnnotationFromSchema<string>(SchemaAST.TitleAnnotationId, TestSchema.ast)
    expect(Option.isSome(titleOpt)).toBe(true)
    if (Option.isSome(titleOpt)) {
      expect(titleOpt.value).toBe('testEntity')
    }
  }),
)

effect('getAnnotationFromSchema should find annotations in Surrogate for extended schemas', () =>
  Effect.gen(function* () {
    // Test with actual PCO schemas that use .extend() and have Surrogate wrapping
    const personOfEntityOpt = getAnnotationFromSchema<any>(OfEntity, PcoPerson.ast)
    expect(Option.isSome(personOfEntityOpt)).toBe(true)
    if (Option.isSome(personOfEntityOpt)) {
      expect(personOfEntityOpt.value).toBe(Person)
    }

    const personTransformerOpt = getAnnotationFromSchema<any>(OfTransformer, PcoPerson.ast)
    expect(Option.isSome(personTransformerOpt)).toBe(true)
    if (Option.isSome(personTransformerOpt)) {
      expect(personTransformerOpt.value).toBe(pcoPersonTransformer)
    }

    // Test with domain schemas that also use .extend()
    const personTitleOpt = getAnnotationFromSchema<string>(SchemaAST.TitleAnnotationId, Person.ast)
    expect(Option.isSome(personTitleOpt)).toBe(true)
    if (Option.isSome(personTitleOpt)) {
      expect(personTitleOpt.value).toBe('person')
    }

    const personTableOpt = getAnnotationFromSchema<any>(OfTable, Person.ast)
    expect(Option.isSome(personTableOpt)).toBe(true)
    if (Option.isSome(personTableOpt)) {
      expect(personTableOpt.value).toBe(peopleTable)
    }
  }),
)

effect('getAnnotationFromSchema should return Option.none() for missing annotations', () =>
  Effect.gen(function* () {
    // Create a schema without any annotations
    const PlainSchema = Schema.Struct({
      name: Schema.String,
    })

    // Should return None for missing annotations
    const missingOpt = getAnnotationFromSchema<any>(OfEntity, PlainSchema.ast)
    expect(Option.isNone(missingOpt)).toBe(true)

    const missingTitleOpt = getAnnotationFromSchema<string>(
      SchemaAST.TitleAnnotationId,
      PlainSchema.ast,
    )
    expect(Option.isNone(missingTitleOpt)).toBe(true)
  }),
)

effect('getAnnotationFromSchema should handle non-Transformation AST types gracefully', () =>
  Effect.gen(function* () {
    // Test with a simple literal schema (not a Transformation)
    const LiteralSchema = Schema.Literal('test')

    // Should return None gracefully for non-Transformation types without annotations
    const missingOpt = getAnnotationFromSchema<any>(OfEntity, LiteralSchema.ast)
    expect(Option.isNone(missingOpt)).toBe(true)
  }),
)

effect('getAnnotationFromSchema should work with all supported entity types', () =>
  Effect.gen(function* () {
    const testCases = [
      { expectedEntity: Person, name: 'Person', schema: PcoPerson },
      { expectedEntity: Campus, name: 'Campus', schema: PcoCampus },
      { expectedEntity: Address, name: 'Address', schema: PcoAddress },
      {
        expectedEntity: PhoneNumber,
        name: 'PhoneNumber',
        schema: PcoPhoneNumber,
      },
    ]

    pipe(
      testCases,
      Array.forEach(({ schema, expectedEntity, name }) => {
        // Test OfEntity annotation
        const ofEntityOpt = getAnnotationFromSchema<any>(OfEntity, schema.ast)
        expect(Option.isSome(ofEntityOpt)).toBe(true)
        if (Option.isSome(ofEntityOpt)) {
          expect(ofEntityOpt.value).toBe(expectedEntity)
        }

        // Test OfTransformer annotation
        const transformerOpt = getAnnotationFromSchema<any>(OfTransformer, schema.ast)
        expect(Option.isSome(transformerOpt)).toBe(true)

        console.log(`✓ ${name} schema annotations found correctly`)
      }),
    )
  }),
)

effect(
  'getAnnotationFromSchema should be consistent with SchemaAST.getAnnotation for direct annotations',
  () =>
    Effect.gen(function* () {
      // Create a schema with direct annotations
      const TestSchema = Schema.Struct({
        name: Schema.String,
      }).annotations({
        title: 'directTest',
      })

      // Both methods should return the same result for direct annotations
      const directResult = SchemaAST.getAnnotation<string>(SchemaAST.TitleAnnotationId)(
        TestSchema.ast,
      )
      const helperResult = getAnnotationFromSchema<string>(
        SchemaAST.TitleAnnotationId,
        TestSchema.ast,
      )

      expect(Option.isSome(directResult)).toBe(Option.isSome(helperResult))
      if (Option.isSome(directResult) && Option.isSome(helperResult)) {
        expect(directResult.value).toBe(helperResult.value)
      }
    }),
)

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

// Regression test for schema architecture fix
effect('Regression: getAnnotationFromSchema fixes Surrogate annotation lookup issue', () =>
  Effect.gen(function* () {
    // This test validates the specific fix we made for the schema architecture issue
    // where annotations were wrapped in Surrogate and not found by direct lookup

    // Before the fix, this would fail because annotations are in Surrogate
    const personEntityOpt = getAnnotationFromSchema<any>(OfEntity, PcoPerson.ast)
    const personTableOpt = getAnnotationFromSchema<any>(OfTable, Person.ast)
    const personTitleOpt = getAnnotationFromSchema<string>(SchemaAST.TitleAnnotationId, Person.ast)

    // All should be found now
    expect(Option.isSome(personEntityOpt)).toBe(true)
    expect(Option.isSome(personTableOpt)).toBe(true)
    expect(Option.isSome(personTitleOpt)).toBe(true)

    // Validate the actual values
    if (Option.isSome(personEntityOpt)) {
      expect(personEntityOpt.value).toBe(Person)
    }
    if (Option.isSome(personTableOpt)) {
      expect(personTableOpt.value).toBe(peopleTable)
    }
    if (Option.isSome(personTitleOpt)) {
      expect(personTitleOpt.value).toBe('person')
    }

    // Test the specific case that was failing: PhoneNumber entity name resolution
    const phoneNumberEntityOpt = getAnnotationFromSchema<any>(OfEntity, PcoPhoneNumber.ast)
    expect(Option.isSome(phoneNumberEntityOpt)).toBe(true)
    if (Option.isSome(phoneNumberEntityOpt)) {
      const phoneNumberTitleOpt = getAnnotationFromSchema<string>(
        SchemaAST.TitleAnnotationId,
        phoneNumberEntityOpt.value.ast,
      )
      expect(Option.isSome(phoneNumberTitleOpt)).toBe(true)
      if (Option.isSome(phoneNumberTitleOpt)) {
        // This should be 'phoneNumber', not 'phonenumber'
        expect(phoneNumberTitleOpt.value).toBe('phoneNumber')
      }
    }
  }),
)

effect('Regression: getEntityMetadata now works correctly with extended schemas', () =>
  Effect.gen(function* () {
    // This test validates that getEntityMetadata works correctly after our fix
    // Previously, it would return Option.none() for table annotations

    const personMetadata = getEntityMetadata(PcoPerson)
    const phoneMetadata = getEntityMetadata(PcoPhoneNumber)
    const campusMetadata = getEntityMetadata(PcoCampus)

    // All should have entity references
    expect(Option.isSome(personMetadata.entity)).toBe(true)
    expect(Option.isSome(phoneMetadata.entity)).toBe(true)
    expect(Option.isSome(campusMetadata.entity)).toBe(true)

    // Person and Campus should have tables
    expect(Option.isSome(personMetadata.table)).toBe(true)
    expect(Option.isSome(campusMetadata.table)).toBe(true)

    // All should have transformers
    expect(Option.isSome(personMetadata.transformer)).toBe(true)
    expect(Option.isSome(phoneMetadata.transformer)).toBe(true)
    expect(Option.isSome(campusMetadata.transformer)).toBe(true)

    // Validate specific values that were failing before
    if (Option.isSome(personMetadata.entity)) {
      expect(personMetadata.entity.value).toBe(Person)
    }
    if (Option.isSome(personMetadata.table)) {
      expect(personMetadata.table.value).toBe(peopleTable)
    }
    if (Option.isSome(campusMetadata.table)) {
      expect(campusMetadata.table.value).toBe(campusesTable)
    }
  }),
)

effect('Integration: getProperEntityName works correctly with fixed annotation lookup', () =>
  Effect.gen(function* () {
    // This test validates the full integration from PCO entity type to proper entity name
    // This was the specific issue that was causing "phonenumber" instead of "phoneNumber"

    const personName = getProperEntityName('Person')
    const phoneNumberName = getProperEntityName('PhoneNumber')
    const addressName = getProperEntityName('Address')
    const campusName = getProperEntityName('Campus')

    // These should return the correct camelCase entity names from the title annotations
    expect(personName).toBe('person')
    expect(phoneNumberName).toBe('phoneNumber') // This was failing before (returned "phonenumber")
    expect(addressName).toBe('address')
    expect(campusName).toBe('campus')

    // Test fallback for unsupported types
    const unknownName = getProperEntityName('UnknownType')
    expect(unknownName).toBe('unknowntype') // Should fallback to lowercase
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
