import { z } from 'zod'

export type UrlParamsFilterType =
  | {
      id: 'videos' | 'channels' | 'playlists' | 'homiliaries'
      value: ReadonlyArray<string>
    }
  | {
      id: 'name'
      value: string
    }

export const ColumnFilterZ = z.object({
  id: z.string(),
  value: z.unknown(),
})

export type BaseFilters = {
  videoIds: ReadonlyArray<string>
  channelIds: ReadonlyArray<string>
  playlistIds: ReadonlyArray<string>
  homiliaryIds: ReadonlyArray<string>
}

export const emptyBaseFilters: BaseFilters = {
  channelIds: [],
  homiliaryIds: [],
  playlistIds: [],
  videoIds: [],
}
