'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsField'
import { Combobox } from '@openfaith/ui/components/ui/combobox'
import { SelectComboBoxTrigger } from '@openfaith/ui/components/ui/combobox-triggers'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Option, pipe } from 'effect'
import type { ComponentProps, ReactNode } from 'react'

export type ComboboxFieldProps = Omit<
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

export const ComboboxField = (props: ComboboxFieldProps) => {
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

  const field = useFieldContext<Array<string>>()

  const value = pipe(
    field.state.value,
    Option.fromNullable,
    Option.getOrElse((): Array<string> => []),
  )

  const { processedError } = getFieldErrors({
    errors: field.state.meta.errors,
    isTouched: field.state.meta.isTouched,
    submissionAttempts: field.form.state.submissionAttempts,
  })

  const selectedOptions = pipe(
    options,
    Array.filter((x) => pipe(value, Array.contains(x.id))),
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
          field.handleChange([...value, id])
        }}
        alignOffset={alignOffset}
        ComboboxTrigger={SelectComboBoxTrigger}
        className={className}
        disabled={disabled}
        emptyText={placeholder}
        mode={'multiple'}
        options={options}
        popOverContentClassName={cn('w-(--radix-popover-trigger-width)', popOverContentClassName)}
        removeItem={(id) => {
          field.handleChange(
            pipe(
              value,
              Array.filter((x) => x !== id),
            ),
          )
        }}
        selectedOptions={selectedOptions}
        {...domProps}
      />
    </InputWrapper>
  )
}
