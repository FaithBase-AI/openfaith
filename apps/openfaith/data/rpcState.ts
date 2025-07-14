import { Rx } from '@effect-rx/rx-react'
import { Effect } from 'effect'
import { AdapterRpcClient, CoreRpcClient, rpcLayer } from './rpcClient'

const runtime = Rx.runtime(rpcLayer)

// Adapter connect mutation Rx
export const adapterConnectRx = runtime.fn(
  Effect.fnUntraced(function* (params: { adapter: string; code: string; redirectUri: string }) {
    const client = yield* AdapterRpcClient
    return yield* client.adapterConnect(params)
  }),
)

// Test function mutation Rx
export const testFunctionRx = runtime.fn(
  Effect.fnUntraced(function* () {
    const client = yield* CoreRpcClient
    return yield* client.testFunction()
  }),
)
