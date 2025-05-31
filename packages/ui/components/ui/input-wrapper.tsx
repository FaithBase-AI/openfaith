import { nullOp } from '@openfaith/shared'
import { InputErrors } from '@openfaith/ui/components/formFields/inputPrimitives'
import { Label } from '@openfaith/ui/components/ui/label'
import { cn } from '@openfaith/ui/shared/utils'
import { Option, pipe, String } from 'effect'
import type { FC, ReactNode } from 'react'

type InputWrapperProps = {
  children: ReactNode
  labelClassName?: string
  errorClassName?: string
  processedError?: string
  required: boolean
  label?: ReactNode
  name?: string | number | symbol
  className?: string
}

export const InputWrapper: FC<InputWrapperProps> = (props) => {
  const {
    children,
    errorClassName,
    processedError,
    labelClassName,
    required,
    label,
    name,
    className,
  } = props

  return (
    <div className={cn('grid w-full max-w-sm items-center gap-1.5', className)}>
      <InputLabel
        required={required}
        label={label}
        processedError={processedError}
        labelClassName={labelClassName}
        name={name}
      />

      {children}

      {pipe(
        processedError,
        Option.fromNullable,
        Option.filter(String.isNonEmpty),
        Option.match({
          onNone: nullOp,
          onSome: (x) => <InputErrors className={errorClassName}>{x}</InputErrors>,
        }),
      )}
    </div>
  )
}

type InputLabelProps = {
  label?: ReactNode
  processedError?: string
  required: boolean
  labelClassName?: string
  name?: string | number | symbol
}

export const InputLabel: FC<InputLabelProps> = (props) => {
  const { label, processedError, labelClassName, required, name } = props

  return pipe(
    label,
    Option.fromNullable,
    Option.filter((x) => x !== ''),
    Option.match({
      onNone: nullOp,
      onSome: (x) => (
        <Label
          htmlFor={name as string}
          className={cn(processedError && 'text-destructive', labelClassName)}
          required={required}
        >
          {x}
        </Label>
      ),
    }),
  )
}
