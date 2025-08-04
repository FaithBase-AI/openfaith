import { noOp, nullOp } from '@openfaith/shared'
import type {
  DetailsPaneEntity,
  DetailsPaneParams,
} from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { DetailsPaneParams as DetailsPaneParamsSchema } from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Array, Boolean, Option, pipe, Schema } from 'effect'
import type { MouseEvent } from 'react'
import { useCallback, useMemo } from 'react'

export function useDetailsPaneState() {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()

  const detailsPaneState = useMemo(
    () =>
      pipe(
        (search as { detailsPane?: unknown })?.detailsPane,
        Option.fromNullable,
        Option.flatMap(Schema.decodeUnknownOption(DetailsPaneParamsSchema)),
        Option.getOrElse((): DetailsPaneParams => []),
      ),
    [search],
  )

  const setDetailsPaneState = useCallback(
    (newState: DetailsPaneParams) => {
      ;(navigate as any)({
        search: {
          detailsPane: newState.length > 0 ? newState : undefined,
        },
      })
    },
    [navigate],
  )

  return [detailsPaneState, setDetailsPaneState] as const
}

export function useOpenDetailsPaneUrl(opts: { replace?: boolean } = {}) {
  const { replace = true } = opts
  const [detailsPaneState] = useDetailsPaneState()

  return useCallback(
    (detailsPaneParams: DetailsPaneParams) => {
      const params = pipe(
        replace,
        Boolean.match({
          onFalse: () => pipe(detailsPaneState, Array.appendAll(detailsPaneParams)),
          onTrue: () => detailsPaneParams,
        }),
      )

      return {
        search: (prev: any) => ({
          ...prev,
          detailsPane: params.length > 0 ? params : undefined,
        }),
        to: '.',
      }
    },
    [replace, detailsPaneState],
  )
}

export function useOpenEntityDetailsPaneUrl<T extends DetailsPaneEntity>(opts: {
  replace?: boolean
  defaultParams: Omit<T, 'entityId'>
}) {
  const { replace = true, defaultParams } = opts

  const openDetailsPaneUrl = useOpenDetailsPaneUrl({ replace })

  return useCallback(
    (
      params: Omit<T, '_tag' | 'tab'> & {
        tab?: T['tab']
      },
    ) => {
      return openDetailsPaneUrl([
        {
          ...defaultParams,
          ...params,
        } as T,
      ])
    },
    [defaultParams, openDetailsPaneUrl],
  )
}

export function useCloseDetailsPane() {
  const [, setDetailsPaneState] = useDetailsPaneState()

  return useCallback(() => {
    setDetailsPaneState([])
  }, [setDetailsPaneState])
}

export function useOpenEntityDetailsPaneTabUrl(opts: { entityId: string; entityType: string }) {
  const { entityId, entityType } = opts
  const [detailsPaneState] = useDetailsPaneState()

  return useCallback(
    (tab: string) => {
      const lastIndex = detailsPaneState.length - 1
      let updatedState: DetailsPaneParams

      if (lastIndex >= 0) {
        updatedState = pipe(
          detailsPaneState,
          Array.modify(lastIndex, (entry: any) => ({
            ...entry,
            tab,
          })),
        ) as DetailsPaneParams
      } else {
        // Fallback if no details pane state exists
        updatedState = [
          {
            _tag: 'entity' as const,
            entityId,
            entityType,
            tab,
          },
        ] as DetailsPaneParams
      }

      return {
        search: (prev: any) => ({
          ...prev,
          detailsPane: updatedState,
        }),
        to: '.',
      }
    },
    [detailsPaneState, entityId, entityType],
  )
}

export function useChangeDetailsPaneEntityId() {
  const [detailsPaneState, setDetailsPaneState] = useDetailsPaneState()

  return useCallback(
    (id: string, entityType: string) => {
      return pipe(
        detailsPaneState,
        Array.last,
        Option.map((entry) => ({
          ...entry,
          entityId: id,
          entityType,
        })),
        Option.match({
          onNone: () => ({
            forceNav: noOp,
            onClick: noOp,
            search: (prev: any) => prev,
            to: '.',
          }),
          onSome: (updatedEntry) => {
            const updatedState = pipe(
              detailsPaneState,
              Array.modify(detailsPaneState.length - 1, () => updatedEntry),
            ) as DetailsPaneParams

            return {
              forceNav: () => setDetailsPaneState(updatedState),
              onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                pipe(
                  event.nativeEvent.ctrlKey || event.nativeEvent.metaKey,
                  Boolean.match({
                    onFalse: () => {
                      event.preventDefault()
                      setDetailsPaneState(updatedState)
                    },
                    onTrue: nullOp,
                  }),
                )
              },
              search: (prev: any) => ({
                ...prev,
                detailsPane: updatedState,
              }),
              to: '.',
            }
          },
        }),
      )
    },
    [detailsPaneState, setDetailsPaneState],
  )
}
