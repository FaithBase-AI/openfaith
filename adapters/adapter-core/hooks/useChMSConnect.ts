'use client'
import { useOauthPopup } from '@openfaith/adapter-core/hooks/useOauthPopup'
import { ChMSConnectResult } from '@openfaith/adapter-core/types'
import { noOp } from '@openfaith/shared'
import { toast, useStableEffect } from '@openfaith/ui'
import { Equivalence, Option, pipe } from 'effect'
import { type PrimitiveAtom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

function useChMSConnect(params: { onConnect: (params: { code: string }) => Promise<void> | void }) {
  // @ts-expect-error
  const { chmsOauthUrl, connectResultAtom, rootDomain, port, chmsName } = this as Parameters<
    typeof getUseChMSConnect
  >[0]
  const { onConnect } = params
  const [connectResult, setConnectResult] = useAtom(connectResultAtom)

  const onCancel = useCallback(() => {
    console.log('closed without signing in')
    setConnectResult(ChMSConnectResult.canceled())
  }, [setConnectResult])

  const { onContainerClick, codeOpt } = useOauthPopup({
    height: 900,
    onCancel,
    port,
    rootDomain,
    title: `Connect to ${chmsName}`,
    url: chmsOauthUrl,
    width: 650,
  })

  useStableEffect(
    () =>
      pipe(
        codeOpt,
        Option.match({
          onNone: noOp,
          onSome: (x) => {
            void (async () => {
              const response = await onConnect({
                code: x,
              })

              setConnectResult(ChMSConnectResult.success(response))
            })()
          },
        }),
      ),
    [codeOpt, setConnectResult],
    Equivalence.tuple(Option.getEquivalence(Equivalence.string), Equivalence.strict()),
  )

  useEffect(() => {
    pipe(
      connectResult,
      ChMSConnectResult.$match({
        canceled: () => {
          toast(`${chmsName} sign in canceled.`, {
            description: `Looks like the sign in process for ${chmsName} was canceled. When you're ready to sign in again, just hit the Connect Button.`,
          })
        },
        error: (x) => {
          switch (x.message) {
            case 'no-people-permissions':
              toast(`Missing ${chmsName} People permissions.`, {
                description: `Looks like you don't have at least Viewer permissions for ${chmsName} People. Please reach out to your ${chmsName} admin to resolve the issue.`,
                // variant: 'destructive',
              })
              break
            default:
              toast(`${chmsName} sign in error.`, {
                description: `Looks like we ran into an issue with logging into ${chmsName}. Please reach out to Steeple support to get it sorted.`,
                // variant: 'destructive',
              })
              break
          }
        },
        failed: () => {
          toast(`${chmsName} sign in error.`, {
            description: `Looks like we ran into an issue with logging into ${chmsName}. Please reach out to Steeple support to get it sorted.`,
            // variant: 'destructive',
          })
        },
        loading: noOp,
        noResult: noOp,
        success: noOp,
      }),
    )
  }, [chmsName, connectResult])

  return {
    connectResult,
    loading: false,
    onClick: () => {
      setConnectResult(ChMSConnectResult.loading())
      onContainerClick()
    },
  }
}

export function getUseChMSConnect(init: {
  chmsOauthUrl: string
  connectResultAtom: PrimitiveAtom<ChMSConnectResult>
  rootDomain: string
  chmsName: string
  port?: number | undefined
}) {
  return useChMSConnect.bind(init)
}
