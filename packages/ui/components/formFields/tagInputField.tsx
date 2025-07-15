'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsField'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { TagInput } from '@openfaith/ui/components/ui/tag-input'
import type { ComponentProps, ReactNode } from 'react'

type TagInputFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  required?: boolean
} & Omit<ComponentProps<typeof TagInput>, 'onChange' | 'value'>

export function TagInputField(props: TagInputFieldProps) {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    ...domProps
  } = props

  const field = useFieldContext<ReadonlyArray<string>>()

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
      <TagInput
        onBlur={field.handleBlur}
        onChange={field.handleChange}
        value={field.state.value}
        {...domProps}
      />
    </InputWrapper>
  )
}
