import { noOp, nullOp } from '@openfaith/shared'
import { IconWrapper } from '@openfaith/ui/components/icons/iconWrapper'
import { Card } from '@openfaith/ui/components/ui/card'
import { cva } from 'class-variance-authority'
import { Boolean, Option, pipe } from 'effect'
import { isNotNullable } from 'effect/Predicate'
import type { FC, HTMLAttributes, ReactNode } from 'react'

const boxEnumVariants = cva(
  'flex w-[calc(50%-8px)] select-none flex-col items-center gap-0 overflow-hidden rounded-2xl border px-8 pt-6 pb-8',
  {
    variants: {
      disabled: {
        false: 'cursor-pointer hover:bg-accent',
        true: 'opacity-60',
      },
      selected: {
        false: 'border-secondary',
        true: 'border-primary bg-secondary',
      },
    },
  },
)

export type BoxOptionProps = {
  disabled?: boolean
  selected?: boolean
  name: string
  description?: ReactNode
  children?: ReactNode
  icon: string | ReactNode
} & HTMLAttributes<HTMLDivElement>

export const BoxOption: FC<BoxOptionProps> = (props) => {
  const {
    disabled = false,
    selected = false,
    onClick,
    name,
    description,
    icon,
    className,
    children,
    ...domProps
  } = props

  return (
    <Card
      className={boxEnumVariants({
        className,
        disabled,
        selected,
      })}
      onClick={(event) =>
        pipe(
          disabled,
          Boolean.match({
            onFalse: () => {
              if (isNotNullable(onClick)) {
                onClick(event)
              }
            },
            onTrue: noOp,
          }),
        )
      }
      {...domProps}
    >
      <IconWrapper size={6}>{icon}</IconWrapper>

      <p className={'mx-auto mt-4 mb-3 text-center font-bold font-display text-xl'}>{name}</p>

      {pipe(
        description,
        Option.fromNullable,
        Option.match({
          onNone: nullOp,
          onSome: (x) => <p className={'text-center font-medium'}>{x}</p>,
        }),
      )}

      {children}
    </Card>
  )
}
