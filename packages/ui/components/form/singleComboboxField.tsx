import { getFieldErrors } from '@openfaith/ui/components/form/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/form/tsField'
import { Combobox } from '@openfaith/ui/components/ui/combobox'
import { SelectComboBoxTrigger } from '@openfaith/ui/components/ui/combobox-triggers'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Option, pipe } from 'effect'
import type { ComponentProps, ReactNode } from 'react'

export type SingleComboboxFieldProps = Omit<
  ComponentProps<typeof Combobox>,
  'selectedOptions' | 'addItem' | 'removeItem' | 'mode' | 'emptyText'
> & {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  placeholder?: string
  className?: string
  required?: boolean
}

export const SingleComboboxField = (props: SingleComboboxFieldProps) => {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    disabled = false,
    className,
    placeholder = 'Select',
    options,
    popOverContentClassName,
    alignOffset = 0,
    ...domProps
  } = props

  const field = useFieldContext<string | null>()

  const value = pipe(
    field.state.value,
    Option.fromNullable,
    Option.getOrElse((): string | null => null),
  )

  const { processedError } = getFieldErrors(field.state.meta.errors)

  const selectedOptions = pipe(
    pipe(
      options,
      Array.filter((x) => x.id === value),
    ),
  )

  return (
    <InputWrapper
      className={wrapperClassName}
      errorClassName={errorClassName}
      label={label}
      labelClassName={labelClassName}
      name={field.name}
      processedError={processedError}
      required={required}
    >
      <Combobox
        addItem={(id) => {
          field.handleChange(id)
        }}
        alignOffset={alignOffset}
        ComboboxTrigger={SelectComboBoxTrigger}
        className={className}
        disabled={disabled}
        emptyText={placeholder}
        mode={'single'}
        options={options}
        popOverContentClassName={cn('w-(--radix-popover-trigger-width)', popOverContentClassName)}
        removeItem={() => {
          field.handleChange(null)
        }}
        selectedOptions={selectedOptions}
        {...domProps}
      />
    </InputWrapper>
  )
}
