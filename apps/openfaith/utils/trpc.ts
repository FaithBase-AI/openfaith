import type { TrpcRouter } from '@openfaith/api'
import { createTRPCContext } from '@trpc/tanstack-react-query'

export const { TRPCProvider, useTRPC } = createTRPCContext<TrpcRouter>()
