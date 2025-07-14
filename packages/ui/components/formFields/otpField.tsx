'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsField'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@openfaith/ui/components/ui/input-otp'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import type { ComponentProps, ReactNode } from 'react'

type OTPFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  required?: boolean
} & Omit<ComponentProps<typeof InputOTP>, 'onChange' | 'value' | 'maxLength' | 'pattern' | 'render'>

export function OTPField(props: OTPFieldProps) {
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
      <InputOTP
        maxLength={6}
        onChange={(value) => field.handleChange(value)}
        pattern={REGEXP_ONLY_DIGITS}
        value={field.state.value}
        {...domProps}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </InputWrapper>
  )
}
