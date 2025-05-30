import { createTRPCRouter, protectedProcedure } from '@openfaith/api/trpc'

export const coreRouter = createTRPCRouter({
  testFunction: protectedProcedure.mutation(async () => {
    try {
      console.log('test function start')

      console.log('test function finish')
    } catch (error) {
      console.log(error)
    }

    return 'yeet'
  }),
})
