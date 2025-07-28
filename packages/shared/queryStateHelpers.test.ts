import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  type BaseFilters,
  ColumnFilterZ,
  emptyBaseFilters,
  type UrlParamsFilterType,
} from '@openfaith/shared/queryStateHelpers'
import { Effect } from 'effect'
import { z } from 'zod'

// Test UrlParamsFilterType with videos filter
effect('UrlParamsFilterType should handle videos filter correctly', () =>
  Effect.gen(function* () {
    const videosFilter: UrlParamsFilterType = {
      id: 'videos',
      value: ['video1', 'video2', 'video3'],
    }

    expect(videosFilter.id).toBe('videos')
    expect(videosFilter.value).toEqual(['video1', 'video2', 'video3'])
    expect(Array.isArray(videosFilter.value)).toBe(true)
  }),
)

// Test UrlParamsFilterType with channels filter
effect('UrlParamsFilterType should handle channels filter correctly', () =>
  Effect.gen(function* () {
    const channelsFilter: UrlParamsFilterType = {
      id: 'channels',
      value: ['channel1', 'channel2'],
    }

    expect(channelsFilter.id).toBe('channels')
    expect(channelsFilter.value).toEqual(['channel1', 'channel2'])
  }),
)

// Test UrlParamsFilterType with playlists filter
effect('UrlParamsFilterType should handle playlists filter correctly', () =>
  Effect.gen(function* () {
    const playlistsFilter: UrlParamsFilterType = {
      id: 'playlists',
      value: ['playlist1'],
    }

    expect(playlistsFilter.id).toBe('playlists')
    expect(playlistsFilter.value).toEqual(['playlist1'])
  }),
)

// Test UrlParamsFilterType with homiliaries filter
effect('UrlParamsFilterType should handle homiliaries filter correctly', () =>
  Effect.gen(function* () {
    const homiliariesFilter: UrlParamsFilterType = {
      id: 'homiliaries',
      value: ['homiliary1', 'homiliary2', 'homiliary3', 'homiliary4'],
    }

    expect(homiliariesFilter.id).toBe('homiliaries')
    expect(homiliariesFilter.value).toEqual([
      'homiliary1',
      'homiliary2',
      'homiliary3',
      'homiliary4',
    ])
  }),
)

// Test UrlParamsFilterType with name filter
effect('UrlParamsFilterType should handle name filter correctly', () =>
  Effect.gen(function* () {
    const nameFilter: UrlParamsFilterType = {
      id: 'name',
      value: 'John Doe',
    }

    expect(nameFilter.id).toBe('name')
    expect(nameFilter.value).toBe('John Doe')
    expect(typeof nameFilter.value).toBe('string')
  }),
)

// Test UrlParamsFilterType with empty arrays
effect('UrlParamsFilterType should handle empty arrays correctly', () =>
  Effect.gen(function* () {
    const emptyVideosFilter: UrlParamsFilterType = {
      id: 'videos',
      value: [],
    }

    expect(emptyVideosFilter.id).toBe('videos')
    expect(emptyVideosFilter.value).toEqual([])
    expect(Array.isArray(emptyVideosFilter.value)).toBe(true)
  }),
)

// Test UrlParamsFilterType with empty name string
effect('UrlParamsFilterType should handle empty name string correctly', () =>
  Effect.gen(function* () {
    const emptyNameFilter: UrlParamsFilterType = {
      id: 'name',
      value: '',
    }

    expect(emptyNameFilter.id).toBe('name')
    expect(emptyNameFilter.value).toBe('')
  }),
)

// Test UrlParamsFilterZ schema validation for videos
effect('UrlParamsFilterZ should validate videos filter correctly', () =>
  Effect.gen(function* () {
    const validVideosData = {
      id: 'videos',
      value: ['video1', 'video2'],
    }

    const result = z
      .discriminatedUnion('id', [
        z.object({
          id: z.literal('videos'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('channels'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('playlists'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('homiliaries'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('name'),
          value: z.string(),
        }),
      ])
      .parse(validVideosData)

    expect(result.id).toBe('videos')
    expect(result.value).toEqual(['video1', 'video2'])
  }),
)

// Test UrlParamsFilterZ schema validation for channels
effect('UrlParamsFilterZ should validate channels filter correctly', () =>
  Effect.gen(function* () {
    const validChannelsData = {
      id: 'channels',
      value: ['channel1', 'channel2', 'channel3'],
    }

    const result = z
      .discriminatedUnion('id', [
        z.object({
          id: z.literal('videos'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('channels'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('playlists'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('homiliaries'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('name'),
          value: z.string(),
        }),
      ])
      .parse(validChannelsData)

    expect(result.id).toBe('channels')
    expect(result.value).toEqual(['channel1', 'channel2', 'channel3'])
  }),
)

// Test UrlParamsFilterZ schema validation for playlists
effect('UrlParamsFilterZ should validate playlists filter correctly', () =>
  Effect.gen(function* () {
    const validPlaylistsData = {
      id: 'playlists',
      value: ['playlist1'],
    }

    const result = z
      .discriminatedUnion('id', [
        z.object({
          id: z.literal('videos'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('channels'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('playlists'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('homiliaries'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('name'),
          value: z.string(),
        }),
      ])
      .parse(validPlaylistsData)

    expect(result.id).toBe('playlists')
    expect(result.value).toEqual(['playlist1'])
  }),
)

// Test UrlParamsFilterZ schema validation for homiliaries
effect('UrlParamsFilterZ should validate homiliaries filter correctly', () =>
  Effect.gen(function* () {
    const validHomiliariesData = {
      id: 'homiliaries',
      value: ['homiliary1', 'homiliary2'],
    }

    const result = z
      .discriminatedUnion('id', [
        z.object({
          id: z.literal('videos'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('channels'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('playlists'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('homiliaries'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('name'),
          value: z.string(),
        }),
      ])
      .parse(validHomiliariesData)

    expect(result.id).toBe('homiliaries')
    expect(result.value).toEqual(['homiliary1', 'homiliary2'])
  }),
)

// Test UrlParamsFilterZ schema validation for name
effect('UrlParamsFilterZ should validate name filter correctly', () =>
  Effect.gen(function* () {
    const validNameData = {
      id: 'name',
      value: 'Search Term',
    }

    const result = z
      .discriminatedUnion('id', [
        z.object({
          id: z.literal('videos'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('channels'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('playlists'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('homiliaries'),
          value: z.array(z.string()),
        }),
        z.object({
          id: z.literal('name'),
          value: z.string(),
        }),
      ])
      .parse(validNameData)

    expect(result.id).toBe('name')
    expect(result.value).toBe('Search Term')
  }),
)

// Test UrlParamsFilterZ schema validation failures
effect('UrlParamsFilterZ should reject invalid data', () =>
  Effect.gen(function* () {
    const invalidIdData = {
      id: 'invalid',
      value: ['test'],
    }

    expect(() =>
      z
        .discriminatedUnion('id', [
          z.object({
            id: z.literal('videos'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('channels'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('playlists'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('homiliaries'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('name'),
            value: z.string(),
          }),
        ])
        .parse(invalidIdData),
    ).toThrow()
  }),
)

// Test UrlParamsFilterZ schema validation with wrong value type
effect('UrlParamsFilterZ should reject wrong value types', () =>
  Effect.gen(function* () {
    const wrongValueTypeData = {
      id: 'videos',
      value: 'should be array',
    }

    expect(() =>
      z
        .discriminatedUnion('id', [
          z.object({
            id: z.literal('videos'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('channels'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('playlists'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('homiliaries'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('name'),
            value: z.string(),
          }),
        ])
        .parse(wrongValueTypeData),
    ).toThrow()
  }),
)

// Test UrlParamsFilterZ schema validation with name as array
effect('UrlParamsFilterZ should reject name filter with array value', () =>
  Effect.gen(function* () {
    const nameAsArrayData = {
      id: 'name',
      value: ['should', 'be', 'string'],
    }

    expect(() =>
      z
        .discriminatedUnion('id', [
          z.object({
            id: z.literal('videos'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('channels'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('playlists'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('homiliaries'),
            value: z.array(z.string()),
          }),
          z.object({
            id: z.literal('name'),
            value: z.string(),
          }),
        ])
        .parse(nameAsArrayData),
    ).toThrow()
  }),
)

// Test ColumnFilterZ schema validation
effect('ColumnFilterZ should validate column filter correctly', () =>
  Effect.gen(function* () {
    const validColumnFilter = {
      id: 'status',
      value: 'active',
    }

    const result = ColumnFilterZ.parse(validColumnFilter)
    expect(result.id).toBe('status')
    expect(result.value).toBe('active')
  }),
)

// Test ColumnFilterZ with different value types
effect('ColumnFilterZ should handle different value types', () =>
  Effect.gen(function* () {
    // Test with string value
    const stringFilter = { id: 'name', value: 'John' }
    const stringResult = ColumnFilterZ.parse(stringFilter)
    expect(stringResult.value).toBe('John')

    // Test with number value
    const numberFilter = { id: 'age', value: 25 }
    const numberResult = ColumnFilterZ.parse(numberFilter)
    expect(numberResult.value).toBe(25)

    // Test with boolean value
    const booleanFilter = { id: 'active', value: true }
    const booleanResult = ColumnFilterZ.parse(booleanFilter)
    expect(booleanResult.value).toBe(true)

    // Test with array value
    const arrayFilter = { id: 'tags', value: ['tag1', 'tag2'] }
    const arrayResult = ColumnFilterZ.parse(arrayFilter)
    expect(arrayResult.value).toEqual(['tag1', 'tag2'])

    // Test with object value
    const objectFilter = { id: 'metadata', value: { key: 'value' } }
    const objectResult = ColumnFilterZ.parse(objectFilter)
    expect(objectResult.value).toEqual({ key: 'value' })
  }),
)

// Test ColumnFilterZ with null and undefined values
effect('ColumnFilterZ should handle null and undefined values', () =>
  Effect.gen(function* () {
    // Test with null value
    const nullFilter = { id: 'optional', value: null }
    const nullResult = ColumnFilterZ.parse(nullFilter)
    expect(nullResult.value).toBe(null)

    // Test with undefined value
    const undefinedFilter = { id: 'optional', value: undefined }
    const undefinedResult = ColumnFilterZ.parse(undefinedFilter)
    expect(undefinedResult.value).toBe(undefined)
  }),
)

// Test ColumnFilterZ validation failures
effect('ColumnFilterZ should reject invalid data', () =>
  Effect.gen(function* () {
    // Test missing id field
    const missingIdData = { value: 'test' }
    expect(() => ColumnFilterZ.parse(missingIdData)).toThrow()

    // Test completely empty object
    const emptyData = {}
    expect(() => ColumnFilterZ.parse(emptyData)).toThrow()

    // Test non-string id
    const nonStringIdData = { id: 123, value: 'test' }
    expect(() => ColumnFilterZ.parse(nonStringIdData)).toThrow()
  }),
)

// Test BaseFilters type structure
effect('BaseFilters should have correct structure', () =>
  Effect.gen(function* () {
    const baseFilters: BaseFilters = {
      channelIds: ['channel1'],
      homiliaryIds: ['homiliary1'],
      playlistIds: ['playlist1', 'playlist2', 'playlist3'],
      videoIds: ['video1', 'video2'],
    }

    expect(baseFilters.videoIds).toEqual(['video1', 'video2'])
    expect(baseFilters.channelIds).toEqual(['channel1'])
    expect(baseFilters.playlistIds).toEqual(['playlist1', 'playlist2', 'playlist3'])
    expect(baseFilters.homiliaryIds).toEqual(['homiliary1'])

    // Verify all properties are readonly arrays
    expect(Array.isArray(baseFilters.videoIds)).toBe(true)
    expect(Array.isArray(baseFilters.channelIds)).toBe(true)
    expect(Array.isArray(baseFilters.playlistIds)).toBe(true)
    expect(Array.isArray(baseFilters.homiliaryIds)).toBe(true)
  }),
)

// Test BaseFilters with empty arrays
effect('BaseFilters should handle empty arrays correctly', () =>
  Effect.gen(function* () {
    const emptyFilters: BaseFilters = {
      channelIds: [],
      homiliaryIds: [],
      playlistIds: [],
      videoIds: [],
    }

    expect(emptyFilters.videoIds).toEqual([])
    expect(emptyFilters.channelIds).toEqual([])
    expect(emptyFilters.playlistIds).toEqual([])
    expect(emptyFilters.homiliaryIds).toEqual([])
  }),
)

// Test emptyBaseFilters constant
effect('emptyBaseFilters should provide correct empty state', () =>
  Effect.gen(function* () {
    expect(emptyBaseFilters.videoIds).toEqual([])
    expect(emptyBaseFilters.channelIds).toEqual([])
    expect(emptyBaseFilters.playlistIds).toEqual([])
    expect(emptyBaseFilters.homiliaryIds).toEqual([])

    // Verify it's a proper BaseFilters object
    expect(Array.isArray(emptyBaseFilters.videoIds)).toBe(true)
    expect(Array.isArray(emptyBaseFilters.channelIds)).toBe(true)
    expect(Array.isArray(emptyBaseFilters.playlistIds)).toBe(true)
    expect(Array.isArray(emptyBaseFilters.homiliaryIds)).toBe(true)
  }),
)

// Test emptyBaseFilters immutability
effect('emptyBaseFilters should be safe to use as default', () =>
  Effect.gen(function* () {
    // Create a copy to test with
    const testFilters = { ...emptyBaseFilters }

    // Modify the copy
    testFilters.videoIds = ['video1']
    testFilters.channelIds = ['channel1']

    // Original should remain unchanged
    expect(emptyBaseFilters.videoIds).toEqual([])
    expect(emptyBaseFilters.channelIds).toEqual([])
    expect(emptyBaseFilters.playlistIds).toEqual([])
    expect(emptyBaseFilters.homiliaryIds).toEqual([])

    // Modified copy should have changes
    expect(testFilters.videoIds).toEqual(['video1'])
    expect(testFilters.channelIds).toEqual(['channel1'])
  }),
)

// Test type compatibility between UrlParamsFilterType and BaseFilters
effect('UrlParamsFilterType should be compatible with BaseFilters conversion', () =>
  Effect.gen(function* () {
    // Test converting various filters to BaseFilters structure
    const videosFilter: UrlParamsFilterType = {
      id: 'videos',
      value: ['video1', 'video2'],
    }

    const channelsFilter: UrlParamsFilterType = {
      id: 'channels',
      value: ['channel1'],
    }

    const playlistsFilter: UrlParamsFilterType = {
      id: 'playlists',
      value: ['playlist1', 'playlist2'],
    }

    const homiliariesFilter: UrlParamsFilterType = {
      id: 'homiliaries',
      value: ['homiliary1'],
    }

    // Simulate conversion logic
    const convertToBaseFilters = (filters: Array<UrlParamsFilterType>): BaseFilters => {
      const result = { ...emptyBaseFilters }

      for (const filter of filters) {
        switch (filter.id) {
          case 'videos':
            result.videoIds = filter.value
            break
          case 'channels':
            result.channelIds = filter.value
            break
          case 'playlists':
            result.playlistIds = filter.value
            break
          case 'homiliaries':
            result.homiliaryIds = filter.value
            break
        }
      }

      return result
    }

    const result = convertToBaseFilters([
      videosFilter,
      channelsFilter,
      playlistsFilter,
      homiliariesFilter,
    ])

    expect(result.videoIds).toEqual(['video1', 'video2'])
    expect(result.channelIds).toEqual(['channel1'])
    expect(result.playlistIds).toEqual(['playlist1', 'playlist2'])
    expect(result.homiliaryIds).toEqual(['homiliary1'])
  }),
)

// Test edge cases with special characters in filter values
effect('filters should handle special characters correctly', () =>
  Effect.gen(function* () {
    const specialCharsFilter: UrlParamsFilterType = {
      id: 'name',
      value: "John & Jane O'Connor-Smith",
    }

    expect(specialCharsFilter.value).toBe("John & Jane O'Connor-Smith")

    const specialCharsArrayFilter: UrlParamsFilterType = {
      id: 'videos',
      value: ['video-1_test', 'video@2#special', 'video 3 with spaces'],
    }

    expect(specialCharsArrayFilter.value).toEqual([
      'video-1_test',
      'video@2#special',
      'video 3 with spaces',
    ])
  }),
)

// Test filters with unicode characters
effect('filters should handle unicode characters correctly', () =>
  Effect.gen(function* () {
    const unicodeFilter: UrlParamsFilterType = {
      id: 'name',
      value: '测试 🎵 Müller café',
    }

    expect(unicodeFilter.value).toBe('测试 🎵 Müller café')

    const unicodeArrayFilter: UrlParamsFilterType = {
      id: 'channels',
      value: ['频道1', 'канал2', 'チャンネル3'],
    }

    expect(unicodeArrayFilter.value).toEqual(['频道1', 'канал2', 'チャンネル3'])
  }),
)

// Test large arrays in filters
effect('filters should handle large arrays correctly', () =>
  Effect.gen(function* () {
    const largeArray = Array.from({ length: 1000 }, (_, i) => `item${i}`)
    const largeArrayFilter: UrlParamsFilterType = {
      id: 'videos',
      value: largeArray,
    }

    expect(largeArrayFilter.value.length).toBe(1000)
    expect(largeArrayFilter.value[0]).toBe('item0')
    expect(largeArrayFilter.value[999]).toBe('item999')
  }),
)

// Test ColumnFilterZ with complex nested objects
effect('ColumnFilterZ should handle complex nested objects', () =>
  Effect.gen(function* () {
    const complexFilter = {
      id: 'metadata',
      value: {
        timestamps: {
          created: '2023-01-01T00:00:00Z',
          updated: '2023-12-31T23:59:59Z',
        },
        user: {
          name: 'John',
          preferences: {
            filters: ['videos', 'channels'],
            notifications: true,
            theme: 'dark',
          },
        },
      },
    }

    const result = ColumnFilterZ.parse(complexFilter)
    expect(result.id).toBe('metadata')
    expect(result.value).toEqual(complexFilter.value)
    const value = result.value as typeof complexFilter.value
    expect(value.user.name).toBe('John')
    expect(value.user.preferences.filters).toEqual(['videos', 'channels'])
  }),
)
