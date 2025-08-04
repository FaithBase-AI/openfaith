'use client'

import { getShortcutKey } from '@openfaith/shared'
import { Kbd } from '@openfaith/ui/components/ui/kbd'
import { EnterIcon } from '@openfaith/ui/icons/enterIcon'
import { Array, Boolean, pipe } from 'effect'
import type { ComponentProps } from 'react'

export type ShortcutKeyProps = ComponentProps<typeof Kbd> & {
  keys: ReadonlyArray<string>
}

export const ShortcutKey = (props: ShortcutKeyProps) => {
  const { keys, ...kbdProps } = props

  const modifiedKeys = pipe(keys, Array.map(getShortcutKey))

  const ariaLabel = pipe(
    modifiedKeys,
    Array.map((x) => x.readable),
    Array.join(' + '),
  )

  return (
    <Kbd aria-label={ariaLabel} data-slot='shortcut-key' {...kbdProps}>
      {pipe(
        modifiedKeys,
        Array.map((x) =>
          pipe(
            x.root === 'enter',
            Boolean.match({
              onFalse: () => <span key={x.readable}>{x.symbol}</span>,
              onTrue: () => <EnterIcon key={x.readable} />,
            }),
          ),
        ),
      )}
    </Kbd>
  )
}
