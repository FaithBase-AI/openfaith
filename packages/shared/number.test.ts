import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { StringOrNumberToNumber } from '@openfaith/shared/number'
import { Effect, Schema } from 'effect'

effect('StringOrNumberToNumber - handles number input', () =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownSync(StringOrNumberToNumber)(42.5)
    expect(result).toBe(42.5)
  }),
)

effect('StringOrNumberToNumber - handles string number input', () =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownSync(StringOrNumberToNumber)('42.5')
    expect(result).toBe(42.5)
  }),
)

effect('StringOrNumberToNumber - handles integer string', () =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownSync(StringOrNumberToNumber)('42')
    expect(result).toBe(42)
  }),
)

effect('StringOrNumberToNumber - handles zero as number', () =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownSync(StringOrNumberToNumber)(0)
    expect(result).toBe(0)
  }),
)

effect('StringOrNumberToNumber - handles zero as string', () =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownSync(StringOrNumberToNumber)('0')
    expect(result).toBe(0)
  }),
)

effect('StringOrNumberToNumber - handles negative numbers', () =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownSync(StringOrNumberToNumber)('-42.5')
    expect(result).toBe(-42.5)
  }),
)

effect('StringOrNumberToNumber - handles scientific notation', () =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownSync(StringOrNumberToNumber)('1.23e-4')
    expect(result).toBe(0.000123)
  }),
)

effect('StringOrNumberToNumber - fails on invalid string', () =>
  Effect.gen(function* () {
    expect(() => {
      Schema.decodeUnknownSync(StringOrNumberToNumber)('not-a-number')
    }).toThrow()
  }),
)

effect('StringOrNumberToNumber - fails on null', () =>
  Effect.gen(function* () {
    expect(() => {
      Schema.decodeUnknownSync(StringOrNumberToNumber)(null)
    }).toThrow()
  }),
)

effect('StringOrNumberToNumber - fails on undefined', () =>
  Effect.gen(function* () {
    expect(() => {
      Schema.decodeUnknownSync(StringOrNumberToNumber)(undefined)
    }).toThrow()
  }),
)

effect('StringOrNumberToNumber - fails on boolean', () =>
  Effect.gen(function* () {
    expect(() => {
      Schema.decodeUnknownSync(StringOrNumberToNumber)(true)
    }).toThrow()
  }),
)

effect('StringOrNumberToNumber - encode transforms number to string', () =>
  Effect.gen(function* () {
    const result = Schema.encodeSync(StringOrNumberToNumber)(42.5)
    expect(result).toBe(42.5)
  }),
)

effect('StringOrNumberToNumber - works with NullOr wrapper', () =>
  Effect.gen(function* () {
    const NullableStringOrNumber = Schema.NullOr(StringOrNumberToNumber)

    expect(Schema.decodeUnknownSync(NullableStringOrNumber)(null)).toBe(null)
    expect(Schema.decodeUnknownSync(NullableStringOrNumber)(42.5)).toBe(42.5)
    expect(Schema.decodeUnknownSync(NullableStringOrNumber)('42.5')).toBe(42.5)
  }),
)
