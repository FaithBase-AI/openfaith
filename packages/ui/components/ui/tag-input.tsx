'use client'

// Comes from https://github.com/shadcn-ui/ui/issues/3647

import { noOp } from '@openfaith/shared'
import { Badge } from '@openfaith/ui/components/ui/badge'
import { Button } from '@openfaith/ui/components/ui/button'
import type { InputProps } from '@openfaith/ui/components/ui/input'
import { XIcon } from '@openfaith/ui/icons/xIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Option, pipe, String } from 'effect'
import { useEffect, useState } from 'react'
import type { z } from 'zod'

const parseTagOpt = (params: { tag: string; tagValidator: z.ZodString }) => {
  const { tag, tagValidator } = params

  const parsedTag = tagValidator.safeParse(tag)

  if (parsedTag.success) {
    return pipe(parsedTag.data, Option.some)
  }

  return Option.none()
}

type TagInputProps = Omit<InputProps, 'value' | 'onChange'> & {
  value?: ReadonlyArray<string>
  onChange: (value: ReadonlyArray<string>) => void
  tagValidator?: z.ZodString
}

const TagInput = (props: TagInputProps) => {
  const { className, value = [], onChange, tagValidator, onBlur, ref, ...domProps } = props

  const [pendingDataPoint, setPendingDataPoint] = useState('')

  useEffect(() => {
    if (
      pipe(pendingDataPoint, String.includes(',')) ||
      pipe(pendingDataPoint, String.endsWith(' '))
    ) {
      const newDataPoints = new Set([
        ...value,
        ...pipe(
          pendingDataPoint,
          String.split(','),
          Array.filterMap((x) => {
            const trimmedX = pipe(x, String.trim)

            return pipe(
              tagValidator,
              Option.fromNullable,
              Option.match({
                onNone: () => pipe(trimmedX, Option.some),
                onSome: (y) => parseTagOpt({ tag: trimmedX, tagValidator: y }),
              }),
            )
          }),
        ),
      ])
      onChange(Array.fromIterable(newDataPoints))
      setPendingDataPoint('')
    }
  }, [pendingDataPoint, onChange, value, tagValidator])

  const addPendingDataPoint = () => {
    if (pendingDataPoint) {
      pipe(
        tagValidator,
        Option.fromNullable,
        Option.match({
          onNone: () => {
            const newDataPoints = new Set([...value, pendingDataPoint])
            onChange(Array.fromIterable(newDataPoints))
            setPendingDataPoint('')
          },
          onSome: (y) =>
            pipe(
              parseTagOpt({ tag: pendingDataPoint, tagValidator: y }),
              Option.match({
                onNone: noOp,
                onSome: (x) => {
                  const newDataPoints = new Set([...value, x])
                  onChange(Array.fromIterable(newDataPoints))
                  setPendingDataPoint('')
                },
              }),
            ),
        }),
      )
    }
  }

  return (
    <div
      className={cn(
        // caveat: :has() variant requires tailwind v3.4 or above: https://tailwindcss.com/blog/tailwindcss-v3-4#new-has-variant
        'flex min-h-10 w-full flex-wrap gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 has-focus-visible:outline-hidden has-focus-visible:ring-2 has-focus-visible:ring-neutral-950 has-focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:has-focus-visible:ring-neutral-300',
        className,
      )}
    >
      {value.map((item) => (
        <Badge key={item} variant={'secondary'}>
          {item}
          <Button
            variant={'ghost'}
            size={'icon'}
            className={'ml-2 size-3'}
            onClick={() => {
              onChange(value.filter((i) => i !== item))
            }}
          >
            <XIcon className={'w-3'} />
          </Button>
        </Badge>
      ))}
      <input
        data-1p-ignore
        className={
          'flex-1 bg-inherit outline-hidden placeholder:text-neutral-500 dark:placeholder:text-neutral-400'
        }
        value={pendingDataPoint}
        onChange={(e) => setPendingDataPoint(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addPendingDataPoint()
          } else if (e.key === 'Backspace' && pendingDataPoint.length === 0 && value.length > 0) {
            e.preventDefault()
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={(e) => {
          addPendingDataPoint()
          onBlur?.(e)
        }}
        {...domProps}
        ref={ref}
      />
    </div>
  )
}

TagInput.displayName = 'TagInput'

export { TagInput }
