import { Data } from 'effect'

export type ChMSConnectResult = Data.TaggedEnum<{
  noResult: {}
  canceled: {}
  loading: {}
  success: {}
  failed: {}
  error: {
    message: string
  }
}>
export const ChMSConnectResult = Data.taggedEnum<ChMSConnectResult>()

export type ServerAdapter = {
  name: string
}
