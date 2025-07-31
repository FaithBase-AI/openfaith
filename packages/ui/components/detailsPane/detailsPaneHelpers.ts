import { nullOp } from '@openfaith/shared'
import type {
  DetailsPaneEntity,
  DetailsPaneParams,
} from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { DetailsPaneParams as DetailsPaneParamsSchema } from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { Array, Boolean, Effect, Option, pipe, Schema } from 'effect'
import { usePathname, useSearchParams } from 'next/navigation'
import { parseAsJson, useQueryState } from 'nuqs'
import type { MouseEvent } from 'react'
import { useCallback } from 'react'

export function useDetailsPaneState() {
  return useQueryState(
    'detailsPane',
    parseAsJson((value: unknown) =>
      Schema.decodeUnknownSync(DetailsPaneParamsSchema)(value),
    ).withDefault([]),
  )
}

export const getDetailsPaneParamsOpt = (currentDetailsPaneParams: string | null) =>
  pipe(
    currentDetailsPaneParams,
    Option.fromNullable,
    Option.flatMap((x) =>
      Effect.gen(function* () {
        const parsed = yield* Effect.try(() => JSON.parse(x))
        const result = yield* Schema.decodeUnknown(DetailsPaneParamsSchema)(parsed)
        return Option.some(result)
      }).pipe(
        Effect.orElse(() => Option.none()),
        Effect.runSync,
      ),
    ),
  )

export function useOpenDetailsPaneUrl(opts: { replace?: boolean } = {}) {
  const { replace = true } = opts
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (detailsPaneParams: DetailsPaneParams) => {
      const newParams = new URLSearchParams(searchParams.toString())

      const oldDetailsPaneParams = newParams.get('detailsPane')

      // If the details pane is open, we sometimes want to replace the current details pane. This toggles the breadcrumbs in the
      // details pane. Here we check to see if this is what we want, and if so, we append the new details pane params to the
      // previous details pane params.
      newParams.set(
        'detailsPane',
        JSON.stringify(
          pipe(
            replace,
            Boolean.match({
              onFalse: () =>
                pipe(
                  oldDetailsPaneParams,
                  getDetailsPaneParamsOpt,
                  Option.getOrElse(() => []),
                  Array.appendAll(detailsPaneParams),
                ),
              onTrue: () => detailsPaneParams,
            }),
          ),
        ),
      )

      return createUrl(pathname, newParams)
    },
    [pathname, replace, searchParams],
  )
}

export function useOpenDetailsPaneUrlNew(opts: { replace?: boolean } = {}) {
  const { replace = true } = opts

  const [detailsPaneState, setDetailsPaneState] = useDetailsPaneState()

  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (detailsPaneParams: DetailsPaneParams) => {
      const newParams = new URLSearchParams(searchParams.toString())

      const params = pipe(
        replace,
        Boolean.match({
          onFalse: () => pipe(detailsPaneState, Array.appendAll(detailsPaneParams)),
          onTrue: () => detailsPaneParams,
        }),
      )

      // If the details pane is open, we sometimes want to replace the current details pane. This toggles the breadcrumbs in the
      // details pane. Here we check to see if this is what we want, and if so, we append the new details pane params to the
      // previous details pane params.
      newParams.set('detailsPane', JSON.stringify(params))

      return {
        href: createUrl(pathname, newParams),
        onClick: async () => {
          await setDetailsPaneState(params)
        },
      }
    },
    [pathname, replace, searchParams, setDetailsPaneState, detailsPaneState],
  )
}

export function useOpenEntityDetailsPaneUrl<T extends DetailsPaneEntity>(opts: {
  replace?: boolean
  defaultParams: Omit<T, 'entityId'>
}) {
  const { replace = true, defaultParams } = opts

  const openDetailsPaneUrl = useOpenDetailsPaneUrlNew({ replace })

  return useCallback(
    (
      params: Omit<T, '_tag' | 'tab'> & {
        tab?: T['tab']
      },
    ) => {
      const { href, onClick } = openDetailsPaneUrl([
        {
          ...defaultParams,
          ...params,
        } as T,
      ])

      return {
        href,
        onClick: (event: MouseEvent<HTMLElement>) => {
          pipe(
            event.nativeEvent.ctrlKey || event.nativeEvent.metaKey,
            Boolean.match({
              onFalse: () => {
                event.preventDefault()
                onClick()
              },
              onTrue: nullOp,
            }),
          )
        },
      }
    },
    [defaultParams, openDetailsPaneUrl],
  )
}

export function useOpenPersonDetailsPaneUrl(opts: { replace?: boolean } = {}) {
  const { replace = true } = opts

  return useOpenEntityDetailsPaneUrl<DetailsPaneEntity>({
    defaultParams: { _tag: 'entity', entityType: 'person', tab: 'details' },
    replace,
  })
}

export function useOpenGroupDetailsPaneUrl(opts: { replace?: boolean } = {}) {
  const { replace = true } = opts

  return useOpenEntityDetailsPaneUrl<DetailsPaneEntity>({
    defaultParams: { _tag: 'entity', entityType: 'group', tab: 'details' },
    replace,
  })
}

export function useCloseDetailsPane() {
  const [, setDetailsPaneState] = useDetailsPaneState()

  return useCallback(async () => {
    await setDetailsPaneState([])
  }, [setDetailsPaneState])
}

// Helper function to create URLs (similar to Homiliary's createUrl)
const createUrl = (pathname: string, searchParams: URLSearchParams): string => {
  const params = searchParams.toString()
  return params ? `${pathname}?${params}` : pathname
}
