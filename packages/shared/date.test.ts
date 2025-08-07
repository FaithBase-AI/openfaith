import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { TimestampToIsoString } from './date'

effect('TimestampToIsoString - decode: converts timestamp to ISO string', () =>
  Effect.gen(function* () {
    const timestamp = 1640995200000 // 2022-01-01T00:00:00Z
    const result = Schema.decodeSync(TimestampToIsoString)(timestamp)

    expect(result).toBe('2022-01-01T00:00:00Z')
  }),
)

effect('TimestampToIsoString - encode: converts ISO string to ISO string', () =>
  Effect.gen(function* () {
    const isoString = '2022-01-01T00:00:00.000Z'
    const result = Schema.encodeSync(TimestampToIsoString)(isoString)

    expect(result).toBe('2022-01-01T00:00:00Z')
  }),
)

effect('TimestampToIsoString - decode: handles different timestamps correctly', () =>
  Effect.gen(function* () {
    const testCases = [
      { expected: '1970-01-01T00:00:00Z', timestamp: 0 },
      { expected: '2020-01-01T00:00:00Z', timestamp: 1577836800000 },
      { expected: '2023-01-01T00:00:00Z', timestamp: 1672531200000 },
      { expected: '2009-02-13T23:31:30Z', timestamp: 1234567890123 },
    ]

    for (const { timestamp, expected } of testCases) {
      const result = Schema.decodeSync(TimestampToIsoString)(timestamp)
      expect(result).toBe(expected)
    }
  }),
)

effect('TimestampToIsoString - encode: handles different ISO strings correctly', () =>
  Effect.gen(function* () {
    const testCases = [
      { expected: '1970-01-01T00:00:00Z', isoString: '1970-01-01T00:00:00.000Z' },
      { expected: '2020-01-01T00:00:00Z', isoString: '2020-01-01T00:00:00.000Z' },
      { expected: '2023-01-01T00:00:00Z', isoString: '2023-01-01T00:00:00.000Z' },
      { expected: '2009-02-13T23:31:30Z', isoString: '2009-02-13T23:31:30.123Z' },
    ]

    for (const { isoString, expected } of testCases) {
      const result = Schema.encodeSync(TimestampToIsoString)(isoString)
      expect(result).toBe(expected)
    }
  }),
)

effect('TimestampToIsoString - roundtrip: timestamp -> ISO -> ISO', () =>
  Effect.gen(function* () {
    const originalTimestamp = 1640995200000

    const isoString = Schema.decodeSync(TimestampToIsoString)(originalTimestamp)
    const backToIso = Schema.encodeSync(TimestampToIsoString)(isoString)

    expect(backToIso).toBe('2022-01-01T00:00:00Z')
  }),
)

effect('TimestampToIsoString - roundtrip: ISO -> ISO -> ISO', () =>
  Effect.gen(function* () {
    const originalIso = '2022-01-01T00:00:00.000Z'

    const normalizedIso = Schema.encodeSync(TimestampToIsoString)(originalIso)
    const backToIso = Schema.decodeSync(TimestampToIsoString)(normalizedIso)

    expect(backToIso).toBe('2022-01-01T00:00:00Z')
  }),
)

effect('TimestampToIsoString - decode: handles negative timestamps', () =>
  Effect.gen(function* () {
    const timestamp = -86400000 // 1969-12-31T00:00:00Z
    const result = Schema.decodeSync(TimestampToIsoString)(timestamp)

    expect(result).toBe('1969-12-31T00:00:00Z')
  }),
)

effect('TimestampToIsoString - encode: handles dates before epoch', () =>
  Effect.gen(function* () {
    const isoString = '1969-12-31T00:00:00.000Z'
    const result = Schema.encodeSync(TimestampToIsoString)(isoString)

    expect(result).toBe('1969-12-31T00:00:00Z')
  }),
)

effect('TimestampToIsoString - decode: handles fractional seconds', () =>
  Effect.gen(function* () {
    const timestamp = 1640995200123 // 2022-01-01T00:00:00Z (milliseconds removed)
    const result = Schema.decodeSync(TimestampToIsoString)(timestamp)

    expect(result).toBe('2022-01-01T00:00:00Z')
  }),
)

effect('TimestampToIsoString - encode: handles ISO strings with fractional seconds', () =>
  Effect.gen(function* () {
    const isoString = '2022-01-01T00:00:00.123Z'
    const result = Schema.encodeSync(TimestampToIsoString)(isoString)

    expect(result).toBe('2022-01-01T00:00:00Z')
  }),
)
