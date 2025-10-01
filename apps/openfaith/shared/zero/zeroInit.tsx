import type { EntityUiConfig } from '@openfaith/schema'
import { env } from '@openfaith/shared'
import { buildSchemaCollectionQuery, useEntityRegistry } from '@openfaith/ui'
import { createClientMutators, type Mutators, schema, type ZSchema } from '@openfaith/zero'
import type { Zero } from '@rocicorp/zero'
import { ZeroProvider } from '@rocicorp/zero/react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { Array, Option, pipe } from 'effect'
import { useMemo } from 'react'

export function ZeroInit({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const initialSession = router.options.context.session
  const { entities } = useEntityRegistry()

  const session = useRouterState({
    select: (state) =>
      pipe(
        state.matches,
        Array.head,
        Option.flatMapNullable((x) => x.context.session),
        Option.getOrElse(() => initialSession),
      ),
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to refresh for session.data.userID
  const opts = useMemo(
    () => ({
      auth: session.zeroAuth,
      init: (zero: Zero<ZSchema, Mutators>) => {
        router.update({
          context: {
            ...router.options.context,
            zero,
          },
        })

        router.invalidate()

        preload(zero, entities)
      },
      mutators: createClientMutators(
        pipe(
          session.data,
          Option.fromNullable,
          Option.map((data) => ({
            activeOrganizationId: data.activeOrganizationId,
            sub: data.userID,
          })),
          Option.getOrUndefined,
        ),
      ),
      schema,
      server: env.VITE_ZERO_SERVER,
      userID: pipe(
        session.data,
        Option.fromNullable,
        Option.match({
          onNone: () => 'anon',
          onSome: (x) => x.userID,
        }),
      ),
    }),
    [session.data, router],
  )

  return <ZeroProvider {...opts}>{children}</ZeroProvider>
}

function preload(z: Zero<ZSchema, Mutators>, entities: Array<EntityUiConfig>) {
  // Delay preload() slightly to avoid blocking UI on first run. We don't need
  // this data to display the UI, it's used by search.
  setTimeout(() => {
    // Why this particular preload?
    //
    // The goal of Zero generally is for every user interaction to be instant.
    // This relies fundamentally on preloading data. But we cannot preload
    // everything, so preloading is at core about guessing data user will most
    // likely need. This is different in every app. Zero gives you the full
    // power of queries to express and orchestrate whatever preload sequence you
    // want.
    //
    // For this app, the primary interface is a search box. Users are more
    // likely to search for popular artists than unpopular so we preload the
    // first 1k artists by popularity.
    //
    // Note that we don't also preload their albums. We could, but there's no
    // reason to as the list UI will do that. We know the user can't navigate to
    // an album they don't see in the UI, so there's no point in preloading
    // more.
    //
    // There is also an interesting interaction with the UI. Since we will get
    // instant local results and full server results async, we ideally want to
    // avoid having the UI jostle. So we want to preload in the same order we
    // tend to display in the UI. That way local results are always also the
    // top ranked results.

    pipe(
      entities,
      Array.forEach((entity) => {
        buildSchemaCollectionQuery(entity.schema, z, 1000).preload()
      }),
    )
  }, 1_000)
}
