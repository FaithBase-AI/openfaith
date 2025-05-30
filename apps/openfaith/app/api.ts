import type { TrpcRouter } from '@openfaith/api'
import { createStartAPIHandler, defaultAPIFileRouteHandler } from '@tanstack/react-start/api'
import { createTRPCContext } from '@trpc/tanstack-react-query'

export default createStartAPIHandler(defaultAPIFileRouteHandler)

export const { TRPCProvider, useTRPC } = createTRPCContext<TrpcRouter>()
