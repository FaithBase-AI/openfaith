import { Rpc, RpcGroup } from '@effect/rpc'
import { TestFunctionError } from './core/coreDomain'
import { AdapterConnectInput, AdapterConnectOutput, AdapterConnectError } from './core/adapterDomain'

export class CoreRpc extends RpcGroup.make(
  Rpc.make('testFunction', {
    error: TestFunctionError,
  }),
) {}

export class AdapterRpc extends RpcGroup.make(
  Rpc.make('adapterConnect', {
    payload: {
      adapter: AdapterConnectInput.fields.adapter,
      code: AdapterConnectInput.fields.code,
      redirectUri: AdapterConnectInput.fields.redirectUri,
    },
    success: AdapterConnectOutput,
    error: AdapterConnectError,
  }),
) {}
