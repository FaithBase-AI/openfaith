import { Rpc, RpcGroup } from '@effect/rpc'
import {
  AdapterConnectError,
  AdapterConnectInput,
  AdapterConnectOutput,
} from './core/adapterDomain'
import { TestFunctionError } from './core/coreDomain'

export class CoreRpc extends RpcGroup.make(
  Rpc.make('testFunction', {
    error: TestFunctionError,
  }),
) {}

export class AdapterRpc extends RpcGroup.make(
  Rpc.make('adapterConnect', {
    error: AdapterConnectError,
    payload: {
      adapter: AdapterConnectInput.fields.adapter,
      code: AdapterConnectInput.fields.code,
      redirectUri: AdapterConnectInput.fields.redirectUri,
    },
    success: AdapterConnectOutput,
  }),
) {}
