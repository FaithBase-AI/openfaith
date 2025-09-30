import { RunnerAddress } from '@effect/cluster'
import { BunClusterShardManagerSocket, BunRuntime } from '@effect/platform-bun'
import { WorkflowPgLive } from '@openfaith/server/live/dbLive'
import { Layer, Logger } from 'effect'

BunClusterShardManagerSocket.layer({
  shardingConfig: {
    shardManagerAddress: RunnerAddress.make('0.0.0.0', 8080),
  },
  storage: 'sql',
}).pipe(
  Layer.provide(WorkflowPgLive),
  Layer.provide(Logger.pretty),
  Layer.launch,
  BunRuntime.runMain,
)
