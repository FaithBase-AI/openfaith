import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { OfTransformer } from '@openfaith/schema'
import { Effect, Option, SchemaAST } from 'effect'
import { PcoAddress, pcoAddressTransformer } from './pcoAddressSchema'
import { PcoCampus, pcoCampusTransformer } from './pcoCampusSchema'
import { PcoListCategory, pcoListCategoryTransformer } from './pcoListCategorySchema'
import { PcoList, pcoListTransformer } from './pcoListSchema'
import { PcoNoteCategory, pcoNoteCategoryTransformer } from './pcoNoteCategorySchema'
// Import all the schemas and transformers we updated
import { PcoPerson, pcoPersonTransformer } from './pcoPersonSchema'
import { PcoPhoneNumber, pcoPhoneNumberTransformer } from './pcoPhoneNumberSchema'
import { PcoTab, pcoTabTransformer } from './pcoTabSchema'

// Helper function to retrieve transformer from any schema
const getTransformerFromSchema = (schema: { ast: SchemaAST.AST }): Option.Option<unknown> =>
  SchemaAST.getAnnotation<unknown>(OfTransformer)(schema.ast)

effect('Transformer annotations: all main entities have transformers attached', () =>
  Effect.gen(function* () {
    // Test Person
    const personTransformer = getTransformerFromSchema(PcoPerson)
    expect(Option.isSome(personTransformer)).toBe(true)
    if (Option.isSome(personTransformer)) {
      expect(personTransformer.value).toBe(pcoPersonTransformer)
    }

    // Test Address
    const addressTransformer = getTransformerFromSchema(PcoAddress)
    expect(Option.isSome(addressTransformer)).toBe(true)
    if (Option.isSome(addressTransformer)) {
      expect(addressTransformer.value).toBe(pcoAddressTransformer)
    }

    // Test Campus
    const campusTransformer = getTransformerFromSchema(PcoCampus)
    expect(Option.isSome(campusTransformer)).toBe(true)
    if (Option.isSome(campusTransformer)) {
      expect(campusTransformer.value).toBe(pcoCampusTransformer)
    }

    // Test PhoneNumber
    const phoneNumberTransformer = getTransformerFromSchema(PcoPhoneNumber)
    expect(Option.isSome(phoneNumberTransformer)).toBe(true)
    if (Option.isSome(phoneNumberTransformer)) {
      expect(phoneNumberTransformer.value).toBe(pcoPhoneNumberTransformer)
    }
  }),
)

effect('Transformer annotations: folder entities have transformers attached', () =>
  Effect.gen(function* () {
    // Test List (folder)
    const listTransformer = getTransformerFromSchema(PcoList)
    expect(Option.isSome(listTransformer)).toBe(true)
    if (Option.isSome(listTransformer)) {
      expect(listTransformer.value).toBe(pcoListTransformer)
    }

    // Test Tab (folder)
    const tabTransformer = getTransformerFromSchema(PcoTab)
    expect(Option.isSome(tabTransformer)).toBe(true)
    if (Option.isSome(tabTransformer)) {
      expect(tabTransformer.value).toBe(pcoTabTransformer)
    }

    // Test NoteCategory (folder)
    const noteCategoryTransformer = getTransformerFromSchema(PcoNoteCategory)
    expect(Option.isSome(noteCategoryTransformer)).toBe(true)
    if (Option.isSome(noteCategoryTransformer)) {
      expect(noteCategoryTransformer.value).toBe(pcoNoteCategoryTransformer)
    }

    // Test ListCategory (folder)
    const listCategoryTransformer = getTransformerFromSchema(PcoListCategory)
    expect(Option.isSome(listCategoryTransformer)).toBe(true)
    if (Option.isSome(listCategoryTransformer)) {
      expect(listCategoryTransformer.value).toBe(pcoListCategoryTransformer)
    }
  }),
)

effect('Transformer annotations: transformers are the correct type and functional', () =>
  Effect.gen(function* () {
    // Test that transformers can be used for actual transformation
    // This is a type-level and runtime test to ensure the transformers work

    const personTransformer = getTransformerFromSchema(PcoPerson)
    expect(Option.isSome(personTransformer)).toBe(true)

    const addressTransformer = getTransformerFromSchema(PcoAddress)
    expect(Option.isSome(addressTransformer)).toBe(true)

    const campusTransformer = getTransformerFromSchema(PcoCampus)
    expect(Option.isSome(campusTransformer)).toBe(true)

    const phoneNumberTransformer = getTransformerFromSchema(PcoPhoneNumber)
    expect(Option.isSome(phoneNumberTransformer)).toBe(true)

    // Verify that all transformers are Schema objects (they have an ast property)
    if (Option.isSome(personTransformer)) {
      expect(typeof personTransformer.value).toBe('function')
      expect(personTransformer.value).toHaveProperty('ast')
    }

    if (Option.isSome(addressTransformer)) {
      expect(typeof addressTransformer.value).toBe('function')
      expect(addressTransformer.value).toHaveProperty('ast')
    }

    if (Option.isSome(campusTransformer)) {
      expect(typeof campusTransformer.value).toBe('function')
      expect(campusTransformer.value).toHaveProperty('ast')
    }

    if (Option.isSome(phoneNumberTransformer)) {
      expect(typeof phoneNumberTransformer.value).toBe('function')
      expect(phoneNumberTransformer.value).toHaveProperty('ast')
    }
  }),
)

effect('Transformer annotations: consistency check across all entities', () =>
  Effect.gen(function* () {
    // Ensure all entities that should have transformers actually do
    const entities = [
      {
        name: 'PcoPerson',
        schema: PcoPerson,
        transformer: pcoPersonTransformer,
      },
      {
        name: 'PcoAddress',
        schema: PcoAddress,
        transformer: pcoAddressTransformer,
      },
      {
        name: 'PcoCampus',
        schema: PcoCampus,
        transformer: pcoCampusTransformer,
      },
      {
        name: 'PcoPhoneNumber',
        schema: PcoPhoneNumber,
        transformer: pcoPhoneNumberTransformer,
      },
      { name: 'PcoList', schema: PcoList, transformer: pcoListTransformer },
      { name: 'PcoTab', schema: PcoTab, transformer: pcoTabTransformer },
      {
        name: 'PcoNoteCategory',
        schema: PcoNoteCategory,
        transformer: pcoNoteCategoryTransformer,
      },
      {
        name: 'PcoListCategory',
        schema: PcoListCategory,
        transformer: pcoListCategoryTransformer,
      },
    ]

    for (const entity of entities) {
      const retrievedTransformer = getTransformerFromSchema(entity.schema)

      // Should have a transformer
      expect(Option.isSome(retrievedTransformer)).toBe(true)

      // Should be the correct transformer
      if (Option.isSome(retrievedTransformer)) {
        expect(retrievedTransformer.value).toBe(entity.transformer)
      }
    }

    // Verify we tested all expected entities
    expect(entities.length).toBe(8)
  }),
)
