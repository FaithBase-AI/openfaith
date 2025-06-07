import { adapterRouter } from '@openfaith/api/router/adapterRouter'
import { coreRouter } from '@openfaith/api/router/coreRouter'
import { createTRPCRouter } from '@openfaith/api/trpc'

export const trpcRouter = createTRPCRouter({
  adapter: adapterRouter,
  core: coreRouter,
})

// export type definition of API
export type TrpcRouter = typeof trpcRouter
