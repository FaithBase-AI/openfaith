'use client'

import { getFieldErrors } from '@openfaith/ui/components/form/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/form/tsField'
import { Input, inputClassName } from '@openfaith/ui/components/ui/input'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { cn } from '@openfaith/ui/shared/utils'
import { Option, pipe, String } from 'effect'
import type { ComponentProps, ReactNode } from 'react'
import { IMaskInput } from 'react-imask'

type InputFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  required?: boolean
} & Omit<ComponentProps<typeof Input>, 'onChange' | 'value'>

export function InputField(props: InputFieldProps) {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    ...domProps
  } = props

  const field = useFieldContext<string>()

  const { processedError } = getFieldErrors(field.state.meta.errors)

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
      <Input
        aria-invalid={!!processedError}
        id={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        // Input requires a string value.
        value={pipe(
          field.state.value,
          Option.fromNullable,
          Option.getOrElse(() => ''),
        )}
        {...domProps}
      />
    </InputWrapper>
  )
}

type SlugInputFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  required?: boolean
  className?: string
} & Omit<ComponentProps<typeof Input>, 'onChange' | 'value'>

export function SlugInputField(props: SlugInputFieldProps) {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    className,
    ...domProps
  } = props

  const field = useFieldContext<string>()

  const { processedError } = getFieldErrors(field.state.meta.errors)

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
      <IMaskInput
        className={cn(inputClassName, className)}
        id={field.name}
        mask={/^[a-zA-Z0-9\s-_]*$/}
        onAccept={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        prepare={(str) => pipe(str, String.toLowerCase, String.replaceAll(' ', '-'))}
        // IMaskInput requires a string value.
        value={pipe(
          field.state.value,
          Option.fromNullable,
          Option.getOrElse(() => ''),
        )}
        {...domProps}
      />
    </InputWrapper>
  )
}
