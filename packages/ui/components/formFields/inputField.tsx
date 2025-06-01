'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsField'
import { Input, inputClassName } from '@openfaith/ui/components/ui/input'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { cn } from '@openfaith/ui/shared/utils'
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

  const { processedError } = getFieldErrors({
    errors: field.state.meta.errors,
    isTouched: field.state.meta.isTouched,
    submissionAttempts: field.form.state.submissionAttempts,
  })

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
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
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

  const { processedError } = getFieldErrors({
    errors: field.state.meta.errors,
    isTouched: field.state.meta.isTouched,
    submissionAttempts: field.form.state.submissionAttempts,
  })

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
      <IMaskInput
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onAccept={(value) => field.handleChange(value)}
        mask={/^[a-zA-Z0-9\s-_]*$/}
        prepare={(str) => {
          // Convert to lowercase
          str = str.toLowerCase()
          str = str.replaceAll(' ', '-')
          return str
        }}
        // @ts-ignore
        className={cn(inputClassName, className)}
        {...domProps}
      />
    </InputWrapper>
  )
}
