// https://github.com/XD2Sketch/react-oauth-popup/tree/master
import { noOp } from '@openfaith/shared'
import { useStableEffect } from '@openfaith/ui/shared/hooks/effect'
import { Array, Equivalence, Option, pipe, String } from 'effect'
import { useEffect, useRef, useState } from 'react'

type IWindowProps = {
  url: string
  title: string
  width: number
  height: number
}

type IPopupProps = IWindowProps & {
  onCancel: () => void
}

const createPopup = ({ url, title, height, width }: IWindowProps) => {
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2.5

  return window.open(
    url,
    title,
    `popup,toolbar=no,menubar=no,width=${width},height=${height},left=${left},top=${top}`,
  )
}

export function useOauthPopup({
  title = '',
  width = 500,
  height = 500,
  url,
  onCancel,
  rootDomain,
  port = 3000,
}: IPopupProps & {
  rootDomain: string
  port?: number | undefined
}) {
  const [externalWindow, setExternalWindow] = useState<Window | null>()
  const intervalRef = useRef<number>(null)
  const [codeOpt, setCodeOpt] = useState<Option.Option<string>>(Option.none())

  const clearTimer = () => {
    pipe(
      intervalRef.current,
      Option.fromNullable,
      Option.map((x) => window.clearInterval(x)),
    )
  }

  const onContainerClick = () => {
    setCodeOpt(Option.none())

    setExternalWindow(
      createPopup({
        url,
        title,
        width,
        height,
      }),
    )
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Pure
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log(event.data, typeof event.data, event.origin)

      if (
        typeof event.data === 'string' &&
        pipe(
          [`http://localhost:${port}`, `https://localhost:${port}`, `https://${rootDomain}`],
          Array.contains(event.origin),
        )
      ) {
        setCodeOpt(pipe(event.data, Option.fromNullable))
        clearTimer()
      }
    }

    pipe(
      externalWindow,
      Option.fromNullable,
      Option.match({
        onNone: noOp,
        onSome: () => window.addEventListener('message', handler),
      }),
    )

    // clean up
    return () => window.removeEventListener('message', handler)
  }, [externalWindow])

  useStableEffect(
    () => {
      if (externalWindow) {
        intervalRef.current = window.setInterval(() => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!externalWindow || externalWindow.closed) {
            pipe(
              codeOpt,
              Option.match({
                onNone: () => {
                  pipe(
                    codeOpt,
                    Option.match({
                      onNone: () => onCancel(),
                      onSome: noOp,
                    }),
                  )
                },
                onSome: noOp,
              }),
            )
            clearTimer()
          }
        }, 700)
      }
    },
    [externalWindow, codeOpt, onCancel],
    Equivalence.tuple(
      Equivalence.strict<typeof externalWindow>(),
      Option.getEquivalence(String.Equivalence),
      Equivalence.strict<typeof onCancel>(),
    ),
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: Pure
  useEffect(
    () => () => {
      if (externalWindow) {
        externalWindow.close()

        pipe(
          codeOpt,
          Option.match({
            onNone: () => onCancel(),
            onSome: noOp,
          }),
        )
      }
    },
    [],
  )

  return { onContainerClick, codeOpt }
}
