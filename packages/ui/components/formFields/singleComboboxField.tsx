import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsForm'
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

  const { processedError } = getFieldErrors({
    errors: field.state.meta.errors,
    isTouched: field.state.meta.isTouched,
    submissionAttempts: field.form.state.submissionAttempts,
  })

  const selectedOptions = pipe(
    pipe(
      options,
      Array.filter((x) => x.id === value),
    ),
  )

  return (
    <InputWrapper
      required={required}
      label={label}
      name={field.name}
      className={wrapperClassName}
      labelClassName={labelClassName}
      errorClassName={errorClassName}
      processedError={processedError}
    >
      <Combobox
        className={className}
        options={options}
        selectedOptions={selectedOptions}
        addItem={(id) => {
          field.handleChange(id)
        }}
        removeItem={() => {
          field.handleChange(null)
        }}
        disabled={disabled}
        mode={'single'}
        ComboboxTrigger={SelectComboBoxTrigger}
        emptyText={placeholder}
        popOverContentClassName={cn('w-(--radix-popover-trigger-width)', popOverContentClassName)}
        alignOffset={alignOffset}
        {...domProps}
      />
    </InputWrapper>
  )
}
