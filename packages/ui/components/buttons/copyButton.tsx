'use client'

import { Button, type ButtonProps } from '@openfaith/ui/components/ui/button'
import { CheckIcon } from '@openfaith/ui/icons/checkIcon'
import { ClipboardIcon } from '@openfaith/ui/icons/clipboardIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, pipe } from 'effect'
import { useEffect, useState } from 'react'

interface CopyButtonProps extends ButtonProps {
  value: string
}

export async function copyToClipboardWithMeta(value: string) {
  await navigator.clipboard.writeText(value)
}

export function CopyButton({ value, className, variant = 'ghost', ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to use the same timeout for all instances
  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 2000)
  }, [hasCopied])

  return (
    <Button
      className={cn('relative z-10', className)}
      onClick={() => {
        copyToClipboardWithMeta(value)
        setHasCopied(true)
      }}
      size='icon-xs'
      variant={variant}
      {...props}
    >
      <span className='sr-only'>Copy</span>
      {pipe(
        hasCopied,
        Boolean.match({
          onFalse: () => <ClipboardIcon />,
          onTrue: () => <CheckIcon />,
        }),
      )}
    </Button>
  )
}
