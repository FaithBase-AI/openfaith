/** biome-ignore-all lint/a11y/useSemanticElements: this is the way */
/** biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: this is the way */
'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsField'
import { InputLabel, InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { Switch } from '@openfaith/ui/components/ui/switch'
import { cn } from '@openfaith/ui/shared/utils'
import type { ComponentProps, ReactNode } from 'react'

type SwitchFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  subWrapperClassName?: string
  required?: boolean
} & Omit<ComponentProps<typeof Switch>, 'onChange' | 'checked'>

export function SwitchField(props: SwitchFieldProps) {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    subWrapperClassName,
    ...domProps
  } = props

  const field = useFieldContext<boolean>()

  const { processedError } = getFieldErrors({
    errors: field.state.meta.errors,
    isTouched: field.state.meta.isTouched,
    submissionAttempts: field.form.state.submissionAttempts,
  })

  return (
    <InputWrapper
      className={wrapperClassName}
      errorClassName={errorClassName}
      labelClassName={labelClassName}
      name={field.name}
      processedError={processedError}
      required={required}
    >
      <label
        className={cn('flex w-full items-center justify-between gap-2 py-2', subWrapperClassName)}
        htmlFor={field.name}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            field.handleChange(!field.state.value)
          }
        }}
        role='button'
        tabIndex={0}
      >
        <InputLabel
          label={label}
          labelClassName={cn(labelClassName, 'cursor-pointer select-none')}
          name={field.name}
          processedError={processedError}
          required={required}
        />

        <Switch
          checked={field.state.value}
          id={field.name}
          onBlur={field.handleBlur}
          onCheckedChange={field.handleChange}
          {...domProps}
        />
      </label>
    </InputWrapper>
  )
}
