'use client'

import { env } from '@openfaith/shared'
import { schema, type ZSchema } from '@openfaith/zero'
import { Zero } from '@rocicorp/zero'
import { ZeroProvider } from '@rocicorp/zero/react'
import { Boolean, Option, pipe } from 'effect'
import { type FC, type ReactNode, useRef } from 'react'

let currentInstance: Zero<ZSchema> | undefined

let currentAuth: string | undefined

function createZero({ auth, userID = 'anon' }: { auth?: string; userID?: string } = {}) {
  return pipe(
    currentInstance,
    Option.fromNullable,
    Option.match({
      onNone: () => {
        currentAuth = auth

        currentInstance = new Zero({
          userID,
          auth,
          server: env.VITE_ZERO_SERVER,
          schema,
          kvStore: pipe(
            typeof window === 'undefined',
            Boolean.match({
              onFalse: () => 'idb',
              onTrue: () => 'mem',
            }),
          ),
        })

        return currentInstance
      },
      onSome: (instance) => {
        if (instance.userID !== userID || currentAuth !== auth) {
          currentAuth = auth

          currentInstance = new Zero({
            userID,
            auth,
            server: env.VITE_ZERO_SERVER,
            schema,
            kvStore: 'idb',
          })

          return currentInstance
        }
        return instance
      },
    }),
  )
}

export type ZeroProviderProps = {
  children: ReactNode
  userId: string
  token?: string
}

const LocalZeroProvider: FC<ZeroProviderProps> = (props) => {
  const { children, token: serverToken, userId: serverUserId } = props

  const instance = useRef(
    createZero({
      auth: serverToken,
      userID: serverUserId,
    }),
  )

  return <ZeroProvider zero={instance.current}>{children}</ZeroProvider>
}

export { LocalZeroProvider as ZeroProvider }
