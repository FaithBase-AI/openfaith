import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  OfCustomField,
  OfEdge,
  OfEntity,
  OfFieldName,
  OfFolder,
  OfFolderType,
  OfIdentifier,
  OfSkipEntity,
  OfSkipField,
  OfTransformer,
} from '@openfaith/schema/shared/schema'
import { Effect, Option, Schema, SchemaAST } from 'effect'

effect('Schema symbols: all symbols should be properly defined', () =>
  Effect.gen(function* () {
    // Test that all symbols are defined and unique
    const symbols = [
      OfFieldName,
      OfCustomField,
      OfSkipField,
      OfEntity,
      OfEdge,
      OfFolder,
      OfSkipEntity,
      OfTransformer,
      OfFolderType,
      OfIdentifier,
    ]

    // All symbols should be defined
    for (const symbol of symbols) {
      expect(typeof symbol).toBe('symbol')
    }

    // All symbols should be unique
    const symbolSet = new Set(symbols)
    expect(symbolSet.size).toBe(symbols.length)
  }),
)

effect('Schema symbols: should follow @openfaith/schema/ naming convention', () =>
  Effect.gen(function* () {
    // Test that new symbols follow the naming convention
    expect(OfTransformer.toString()).toBe('Symbol(@openfaith/schema/transformer)')
    expect(OfFolderType.toString()).toBe('Symbol(@openfaith/schema/folderType)')
    expect(OfIdentifier.toString()).toBe('Symbol(@openfaith/schema/identifier)')

    // Test that updated symbols follow the naming convention
    expect(OfFieldName.toString()).toBe('Symbol(@openfaith/schema/fieldName)')
    expect(OfCustomField.toString()).toBe('Symbol(@openfaith/schema/customField)')
    expect(OfSkipField.toString()).toBe('Symbol(@openfaith/schema/skipField)')
    expect(OfEntity.toString()).toBe('Symbol(@openfaith/schema/entity)')
    expect(OfEdge.toString()).toBe('Symbol(@openfaith/schema/edge)')
    expect(OfFolder.toString()).toBe('Symbol(@openfaith/schema/folder)')
    expect(OfSkipEntity.toString()).toBe('Symbol(@openfaith/schema/skipEntity)')
  }),
)

effect('Schema symbols: should work with Effect Schema annotations', () =>
  Effect.gen(function* () {
    // Create a test schema with annotations
    const TestSchema = Schema.Struct({
      name: Schema.String.annotations({
        [OfFieldName]: 'displayName',
        [OfCustomField]: true,
      }),
    }).annotations({
      [OfEntity]: 'testEntity',
      [OfIdentifier]: 'test-schema',
      [OfFolderType]: 'test_folder',
    })

    // Test that annotations can be retrieved
    const fieldNameAnnotation = SchemaAST.getAnnotation<string>(OfFieldName)(
      TestSchema.fields.name.ast,
    )
    expect(Option.isSome(fieldNameAnnotation)).toBe(true)
    if (Option.isSome(fieldNameAnnotation)) {
      expect(fieldNameAnnotation.value).toBe('displayName')
    }

    const customFieldAnnotation = SchemaAST.getAnnotation<boolean>(OfCustomField)(
      TestSchema.fields.name.ast,
    )
    expect(Option.isSome(customFieldAnnotation)).toBe(true)
    if (Option.isSome(customFieldAnnotation)) {
      expect(customFieldAnnotation.value).toBe(true)
    }

    const entityAnnotation = SchemaAST.getAnnotation<string>(OfEntity)(TestSchema.ast)
    expect(Option.isSome(entityAnnotation)).toBe(true)
    if (Option.isSome(entityAnnotation)) {
      expect(entityAnnotation.value).toBe('testEntity')
    }

    const identifierAnnotation = SchemaAST.getAnnotation<string>(OfIdentifier)(TestSchema.ast)
    expect(Option.isSome(identifierAnnotation)).toBe(true)
    if (Option.isSome(identifierAnnotation)) {
      expect(identifierAnnotation.value).toBe('test-schema')
    }

    const folderTypeAnnotation = SchemaAST.getAnnotation<string>(OfFolderType)(TestSchema.ast)
    expect(Option.isSome(folderTypeAnnotation)).toBe(true)
    if (Option.isSome(folderTypeAnnotation)) {
      expect(folderTypeAnnotation.value).toBe('test_folder')
    }
  }),
)
