'use client'

import { nullOp } from '@openfaith/shared'
import { Form } from '@openfaith/ui/components/form/form'
import { Divider } from '@openfaith/ui/components/ui/divider'
import { Separator } from '@openfaith/ui/components/ui/separator'
import { cn } from '@openfaith/ui/shared/utils'
import { Option, pipe } from 'effect'
import type { ComponentProps, FC, ReactNode } from 'react'

const formColumnClassName = 'flex flex-col gap-3 flex-1'

type CardFormProps = Omit<ComponentProps<typeof Form>, 'children'> & {
  Primary: ReactNode
  Secondary?: ReactNode
  Actions?: ReactNode
  showTopSeparator?: boolean
  actionsClassName?: string
}

/**
 * A form component designed for use within Card components.
 * Provides a clean layout with optional secondary column and actions.
 */
export const CardForm: FC<CardFormProps> = (props) => {
  const {
    Primary,
    Secondary,
    Actions,
    form,
    className,
    showTopSeparator = false,
    actionsClassName,
    ...domProps
  } = props

  return (
    <>
      {showTopSeparator && <Separator />}

      <Form
        className={cn('flex w-full flex-col items-stretch gap-0', className)}
        form={form}
        {...domProps}
      >
        <div className='flex flex-col gap-3 md:flex-row'>
          <div className={formColumnClassName}>{Primary}</div>
          {pipe(
            Secondary,
            Option.fromNullable,
            Option.match({
              onNone: nullOp,
              onSome: (content) => (
                <>
                  <Divider orientation={'vertical'} />
                  <div className={formColumnClassName}>{content}</div>
                </>
              ),
            }),
          )}
        </div>

        {pipe(
          Actions,
          Option.fromNullable,
          Option.match({
            onNone: nullOp,
            onSome: (actions) => (
              <div className={cn('mt-6 flex items-center justify-end gap-3', actionsClassName)}>
                {actions}
              </div>
            ),
          }),
        )}
      </Form>
    </>
  )
}
