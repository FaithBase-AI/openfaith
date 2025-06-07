import { createTRPCRouter, orgProcedure } from '@openfaith/api/trpc'
import { Schema } from 'effect'

export const AdapterConnectRequest = Schema.Struct({
  adapter: Schema.String,
  code: Schema.String,
})
export type AdapterConnectRequest = typeof AdapterConnectRequest.Type

export const AdapterConnectResponse = Schema.Literal('success', 'failed')
export type AdapterConnectResponse = typeof AdapterConnectResponse.Type

export const adapterRouter = createTRPCRouter({
  adapterConnect: orgProcedure
    .input(Schema.decodeUnknownSync(AdapterConnectRequest))
    .output(Schema.decodeUnknownSync(AdapterConnectResponse))
    // biome-ignore lint/suspicious/useAwait: no await
    .mutation(async () => {
      try {
        console.log('test function start')

        console.log('test function finish')
      } catch (error) {
        console.log(error)
      }

      return 'success' as const
    }),
})
