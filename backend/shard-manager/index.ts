import { NodeClusterShardManagerSocket, NodeRuntime } from '@effect/platform-node'
import { PgLive } from '@openfaith/db'
import { Layer, Logger } from 'effect'

NodeClusterShardManagerSocket.layer({
  storage: 'sql',
}).pipe(Layer.provide(PgLive), Layer.provide(Logger.pretty), Layer.launch, NodeRuntime.runMain)
