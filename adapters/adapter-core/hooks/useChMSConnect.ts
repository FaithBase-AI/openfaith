'use client'
import { useOauthPopup } from '@openfaith/adapter-core/hooks/useOauthPopup'
import { ChMSConnectResult } from '@openfaith/adapter-core/types'
import { noOp } from '@openfaith/shared'
import { useStableEffect } from '@openfaith/ui/shared/hooks/effect'
import { Equivalence, Option, pipe, String } from 'effect'
import { type PrimitiveAtom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const getUseChMSConnect =
  (params: {
    chmsOauthUrl: string
    connectResultAtom: PrimitiveAtom<ChMSConnectResult>
    onConnect: (params: { code: string }) => Promise<void>
    rootDomain: string
    chmsName: string
    port?: number | undefined
  }) =>
  () => {
    const { chmsOauthUrl, connectResultAtom, onConnect, rootDomain, port, chmsName } = params
    const [connectResult, setConnectResult] = useAtom(connectResultAtom)

    const { onContainerClick, codeOpt } = useOauthPopup({
      title: `Connect to ${chmsName}`,
      height: 900,
      width: 650,
      url: chmsOauthUrl,
      onCancel: () => {
        console.log('closed without signing in')
        setConnectResult(ChMSConnectResult.canceled())
      },
      rootDomain,
      port,
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
      Equivalence.tuple(Option.getEquivalence(String.Equivalence), Equivalence.strict()),
    )

    useEffect(() => {
      pipe(
        connectResult,
        ChMSConnectResult.$match({
          noResult: noOp,
          canceled: () => {
            toast(`${chmsName} sign in canceled.`, {
              description: `Looks like the sign in process for ${chmsName} was canceled. When you're ready to sign in again, just hit the Connect Button.`,
            })
          },
          loading: noOp,
          success: noOp,
          failed: () => {
            toast(`${chmsName} sign in error.`, {
              description: `Looks like we ran into an issue with logging into ${chmsName}. Please reach out to Steeple support to get it sorted.`,
              // variant: 'destructive',
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
        }),
      )
    }, [chmsName, connectResult])

    return {
      onClick: () => {
        setConnectResult(ChMSConnectResult.loading())

        onContainerClick()
      },
      loading: connectResult._tag === 'loading',
    }
  }
