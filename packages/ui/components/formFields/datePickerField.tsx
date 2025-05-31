'use client'

import { getFieldErrors } from '@openfaith/ui/components/formFields/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/formFields/tsForm'
import { Button } from '@openfaith/ui/components/ui/button'
import { Calendar } from '@openfaith/ui/components/ui/calendar'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { Popover, PopoverContent, PopoverTrigger } from '@openfaith/ui/components/ui/popover'
import { CalendarIcon } from '@openfaith/ui/icons/calendarIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { format, getTime } from 'date-fns/fp'
import { pipe } from 'effect'
import type { ReactNode } from 'react'

export type DatePickerFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  placeholder?: string
  className?: string
  required?: boolean
}

export const DatePickerField = (props: DatePickerFieldProps) => {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    placeholder = 'Pick a date',
    className,
    required = false,
  } = props

  const field = useFieldContext<number | undefined>()

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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !field.state.value && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon className='mr-2 size-4' />
            {field.state.value ? (
              pipe(new Date(field.state.value), format('PPP'))
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={field.state.value ? new Date(field.state.value) : undefined}
            onSelect={(date) => field.handleChange(date ? getTime(date) : undefined)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </InputWrapper>
  )
}
