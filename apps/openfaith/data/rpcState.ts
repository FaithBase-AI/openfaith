import { Atom } from '@effect-atom/atom-react'
import { AdapterRpcClient, CoreRpcClient, rpcLayer } from '@openfaith/openfaith/data/rpcClient'
import { Effect } from 'effect'

const runtime = Atom.runtime(rpcLayer)

export const adapterConnectAtom = runtime.fn(
  Effect.fnUntraced(function* (params: { adapter: string; code: string; redirectUri: string }) {
    const client = yield* AdapterRpcClient
    return yield* client.adapterConnect(params)
  }),
)

export const testFunctionAtom = runtime.fn(
  Effect.fnUntraced(function* () {
    const client = yield* CoreRpcClient
    return yield* client.testFunction()
  }),
)
