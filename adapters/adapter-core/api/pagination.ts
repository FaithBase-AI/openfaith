import { Chunk, Effect, Option, Stream } from 'effect'

export const createPaginatedStream = Effect.fn('createPaginatedStream')(function* <
  Req extends {
    urlParams: { offset?: number } & Record<string, any>
  },
  A extends {
    meta: {
      next?: { offset: number }
    }
  },
  E,
  R,
>(apiEffect: (request: Req) => Effect.Effect<A, E, R>, baseParams: Req) {
  return Stream.paginateChunkEffect(0, (currentOffset) => {
    return apiEffect({
      ...baseParams,
      urlParams: { ...baseParams.urlParams, offset: currentOffset },
    }).pipe(
      Effect.map((response) => {
        const dataChunk = Chunk.make(response)

        if (!response.meta.next) {
          return [dataChunk, Option.none<number>()]
        }
        return [dataChunk, Option.some(response.meta.next.offset)]
      }),
    )
  })
})
