import { Atom } from '@effect-atom/atom-react'
import {
  AdapterRpcClient,
  AdminRpcClient,
  CoreRpcClient,
  rpcLayer,
} from '@openfaith/openfaith/data/rpcClient'
import { Effect } from 'effect'

const runtime = Atom.runtime(rpcLayer)

export const adapterConnectAtom = runtime.fn(
  Effect.fnUntraced(function* (params: { adapter: string; code: string; redirectUri: string }) {
    const client = yield* AdapterRpcClient
    return yield* client.adapterConnect(params)
  }),
)

export const adapterReSyncAtom = runtime.fn(
  Effect.fnUntraced(function* (
    params: Parameters<typeof AdapterRpcClient.prototype.adapterReSync>[0],
  ) {
    const client = yield* AdapterRpcClient

    return yield* client.adapterReSync(params)
  }),
)

export const adminAdapterReSyncAtom = runtime.fn(
  Effect.fnUntraced(function* (
    params: Parameters<typeof AdminRpcClient.prototype.orgAdapterReSync>[0],
  ) {
    const client = yield* AdminRpcClient

    return yield* client.orgAdapterReSync(params)
  }),
)

export const testFunctionAtom = runtime.fn(
  Effect.fnUntraced(function* () {
    const client = yield* CoreRpcClient
    return yield* client.testFunction()
  }),
)
