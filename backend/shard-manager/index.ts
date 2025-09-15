import { BunClusterShardManagerSocket, BunRuntime } from '@effect/platform-bun'
import { PgLive } from '@openfaith/server/live/dbLive'
import { Layer, Logger } from 'effect'

BunClusterShardManagerSocket.layer({
  storage: 'sql',
}).pipe(Layer.provide(PgLive), Layer.provide(Logger.pretty), Layer.launch, BunRuntime.runMain)
