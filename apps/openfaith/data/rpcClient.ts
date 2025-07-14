import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { AdapterRpc, CoreRpc } from '@openfaith/domain'
import { Effect, Layer } from 'effect'

// Create the protocol layer for HTTP communication
const ProtocolLayer = RpcClient.layerProtocolHttp({
  url: '/api/api',
}).pipe(
  Layer.provide([
    // Use fetch for HTTP requests
    FetchHttpClient.layer,
    // Use ndjson for serialization
    RpcSerialization.layerJson,
  ]),
)

// Create the RPC client services
export class CoreRpcClient extends Effect.Service<CoreRpcClient>()('CoreRpcClient', {
  dependencies: [ProtocolLayer],
  scoped: RpcClient.make(CoreRpc),
}) {}

export class AdapterRpcClient extends Effect.Service<AdapterRpcClient>()('AdapterRpcClient', {
  dependencies: [ProtocolLayer],
  scoped: RpcClient.make(AdapterRpc),
}) {}

// Create a runtime for the RPC clients
const RpcLayer = Layer.mergeAll(CoreRpcClient.Default, AdapterRpcClient.Default)

// Export the layer for use in effect-rx
export const rpcLayer = RpcLayer
