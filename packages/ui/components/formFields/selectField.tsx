'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsForm'
import { Button } from '@openfaith/ui/components/ui/button'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@openfaith/ui/components/ui/select'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Boolean, Option, pipe, String } from 'effect'
import { Select as SelectPrimitive } from 'radix-ui'
import type { ComponentProps, ComponentRef, FC, ForwardedRef, ReactNode } from 'react'

type SelectFieldProps = {
  defaultValue?: string
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  SelectTrigger?: typeof DefaultSelectTrigger
  Icon?: ReactNode
  placeholder?: string
  className?: string
  required?: boolean
  options: ReadonlyArray<{ name: string; value: string; disabled?: boolean }>
} & Omit<ComponentProps<typeof Select>, 'onChange' | 'value'>

export function SelectField(props: SelectFieldProps) {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    defaultValue,
    disabled = false,
    SelectTrigger: PassedSelectTrigger = DefaultSelectTrigger,
    className,
    placeholder,
    Icon,
    options,
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
      <Select
        defaultValue={defaultValue}
        value={field.state.value}
        onValueChange={(x) => {
          field.handleChange(x)
          field.handleBlur()
        }}
        disabled={disabled}
        {...domProps}
      >
        <PassedSelectTrigger
          className={cn('w-full', className)}
          placeholder={placeholder}
          Icon={Icon}
          hasValue={pipe(
            field.state.value,
            Option.fromNullable,
            Option.match({
              onNone: () => false,
              onSome: (x) => pipe(x, String.isNonEmpty),
            }),
          )}
          disabled={disabled}
        />
        <SelectContent>
          {pipe(
            options,
            Array.map((x) => (
              <SelectItem value={x.value} key={x.value} disabled={x.disabled}>
                {x.name}
              </SelectItem>
            )),
          )}
        </SelectContent>
      </Select>
    </InputWrapper>
  )
}

type DefaultSelectProps = {
  placeholder?: string
  ref?: ForwardedRef<ComponentRef<typeof SelectTrigger> | null>
  className?: string
  Icon?: ReactNode
  hasValue: boolean
  disabled?: boolean
}

const DefaultSelectTrigger: FC<DefaultSelectProps> = (props) => {
  const { placeholder, ref, className, Icon, hasValue: _hasValue, ...domProps } = props

  return (
    <SelectTrigger className={className} ref={ref} {...domProps}>
      {Icon}
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  )
}

export const GhostSelectTrigger: FC<DefaultSelectProps> = (props) => {
  const { placeholder, ref, className, Icon, hasValue, ...domProps } = props

  return (
    <SelectPrimitive.Trigger ref={ref} asChild {...domProps}>
      <Button size={'sm'} variant={'ghost'} className={cn('shrink-0 overflow-hidden', className)}>
        {Icon}
        <span
          className={pipe(
            hasValue,
            Boolean.match({
              onFalse: () => 'opacity-50',
              onTrue: () => '',
            }),
          )}
        >
          <SelectValue placeholder={placeholder} />
        </span>
      </Button>
    </SelectPrimitive.Trigger>
  )
}
