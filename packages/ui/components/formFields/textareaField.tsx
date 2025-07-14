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
      className={wrapperClassName}
      errorClassName={errorClassName}
      label={label}
      labelClassName={labelClassName}
      name={field.name}
      processedError={processedError}
      required={required}
    >
      <Textarea
        id={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
        {...domProps}
      />
    </InputWrapper>
  )
}
