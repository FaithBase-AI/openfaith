import type { mkPcoCollectionSchema, PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import { Chunk, Effect, Option, pipe, type Schema, Stream } from 'effect'

export const createPaginatedStream = <
  Req extends {
    urlParams: { offset?: number } & Record<string, any>
  },
  A extends Schema.Schema.Type<
    ReturnType<typeof mkPcoCollectionSchema<PcoBaseEntity, PcoBaseEntity>>
  >,
  E,
  R,
>(
  apiEffect: (request: Req) => Effect.Effect<A, E, R>,
  baseParams: Req,
) =>
  Stream.paginateChunkEffect(0, (currentOffset) =>
    apiEffect({
      ...baseParams,
      urlParams: { ...baseParams.urlParams, offset: currentOffset },
    }).pipe(
      Effect.map((response) =>
        pipe(
          response.meta.next,
          Option.fromNullable,
          Option.match({
            onNone: () => [Chunk.make(response), Option.none<number>()],
            onSome: (next) => [Chunk.make(response), Option.some(next.offset)],
          }),
        ),
      ),
    ),
  )
