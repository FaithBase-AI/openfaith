import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { PgContainer } from '@openfaith/workers/helpers/test-utils/utils-pg'
import { Layer } from 'effect'

export const DrizzlePgLive = PgDrizzle.layer.pipe(Layer.provideMerge(PgContainer.ClientLive))
