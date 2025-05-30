'use client'
import { useOauthPopup } from '@openfaith/adapter-core/hooks/useOauthPopup'
import { ChMSConnectResult } from '@openfaith/adapter-core/types'
import { env, noOp } from '@openfaith/shared'
import { useStableEffect } from '@openfaith/ui/shared/hooks/effect'
import { Array, Equivalence, Option, pipe, String } from 'effect'
import { type PrimitiveAtom, useAtom } from 'jotai'
import qs from 'qs'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const getUseChMSConnect =
  (params: {
    chmsOauthUrl: string
    connectResultAtom: PrimitiveAtom<ChMSConnectResult>
    redirectUri: string
    scopes: Array<string>
    onConnect: (params: { code: string }) => Promise<void>
    rootDomain: string
    port?: number | undefined
  }) =>
  () => {
    const { chmsOauthUrl, connectResultAtom, redirectUri, scopes, onConnect, rootDomain, port } =
      params
    const [connectResult, setConnectResult] = useAtom(connectResultAtom)

    const { onContainerClick, codeOpt } = useOauthPopup({
      title: 'Connect to Planning Center',
      height: 900,
      width: 650,
      url: `${chmsOauthUrl}?${qs.stringify({
        client_id: env.VITE_PLANNING_CENTER_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: pipe(scopes, Array.join(' ')),
        response_type: 'code',
      })}`,
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
          'no-result': noOp,
          canceled: () => {
            toast('Planning Center sign in canceled.', {
              description:
                "Looks like the sign in process for Planning Center was canceled. When you're ready to sign in again, just hit the Connect Button.",
            })
          },
          loading: noOp,
          success: noOp,
          failed: () => {
            toast('Planning Center sign in error.', {
              description:
                'Looks like we ran into an issue with logging into Planning Center. Please reach out to Steeple support to get it sorted.',
              // variant: 'destructive',
            })
          },
          error: (x) => {
            switch (x.message) {
              case 'no-people-permissions':
                toast('Missing Planning Center People permissions.', {
                  description:
                    "Looks like you don't have at least Viewer permissions for Planning Center People. Please reach out to your Planning Center admin to resolve the issue.",
                  // variant: 'destructive',
                })
                break
              default:
                toast('Planning Center sign in error.', {
                  description:
                    'Looks like we ran into an issue with logging into Planning Center. Please reach out to Steeple support to get it sorted.',
                  // variant: 'destructive',
                })
                break
            }
          },
        }),
      )
    }, [connectResult])

    return {
      onClick: () => {
        setConnectResult(ChMSConnectResult.loading())

        onContainerClick()
      },
      loading: connectResult._tag === 'loading',
    }
  }
