'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsField'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { Textarea } from '@openfaith/ui/components/ui/textarea'
import type { ComponentProps, ReactNode } from 'react'

type TextareaFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  required?: boolean
} & Omit<ComponentProps<typeof Textarea>, 'onChange' | 'value'>

export function TextareaField(props: TextareaFieldProps) {
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
      <Textarea
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...domProps}
      />
    </InputWrapper>
  )
}
