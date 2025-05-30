import { Data } from 'effect'

export type ChMSConnectResult = Data.TaggedEnum<{
  'no-result': {}
  canceled: {}
  loading: {}
  success: {}
  failed: {}
  error: {
    message: string
  }
}>
export const ChMSConnectResult = Data.taggedEnum<ChMSConnectResult>()

export type Adapter = {
  name: string
}
