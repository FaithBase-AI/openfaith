import { coreRouter } from '@openfaith/api/router/core'
import { createTRPCRouter } from '@openfaith/api/trpc'

export const trpcRouter = createTRPCRouter({
  core: coreRouter,
})

// export type definition of API
export type TrpcRouter = typeof trpcRouter
