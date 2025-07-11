'use client'

import { Option, pipe } from 'effect'
import type { FC } from 'react'
import { useEffect } from 'react'

type PostCodeMessageProps = {
  code: string
}

export const PostCodeMessage: FC<PostCodeMessageProps> = (props) => {
  const { code } = props

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    pipe(
      window.opener as typeof window | undefined | null,
      Option.fromNullable,
      Option.map((x) => {
        x.postMessage(code, '*')
      }),
    )

    window.close()
  }, [code])

  return null
}
