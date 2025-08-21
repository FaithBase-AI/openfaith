'use client'

import { getFieldErrors } from '@openfaith/ui/components/form/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/form/tsField'
import {
  ResponsiveMenu,
  ResponsiveMenuContent,
  ResponsiveMenuItem,
  ResponsiveMenuLabel,
  ResponsiveMenuSeparator,
  ResponsiveMenuTrigger,
} from '@openfaith/ui/components/responsiveMenu'
import { Button } from '@openfaith/ui/components/ui/button'
import { Calendar } from '@openfaith/ui/components/ui/calendar'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { CalendarIcon } from '@openfaith/ui/icons/calendarIcon'
import { ClockIcon } from '@openfaith/ui/icons/clockIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { format, getHours, getMinutes, getTime, setHours, setMinutes } from 'date-fns/fp'
import { Option, pipe } from 'effect'
import type { ReactNode } from 'react'

export type DateTimeFieldProps = {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  placeholder?: string
  className?: string
  required?: boolean
}

const displayDateTime = (date: Date) => {
  return pipe(date, format('d MMM yyyy h:mm aa'))
}

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  const date = pipe(new Date(), setHours(hour), setMinutes(minute))
  return {
    label: pipe(date, format('h:mm aa')),
    value: date,
  }
})

export const DateTimeField = (props: DateTimeFieldProps) => {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    placeholder = 'Select date and time',
    className,
    required = false,
  } = props

  const field = useFieldContext<number | undefined>()

  const { processedError } = getFieldErrors(field.state.meta.errors)

  const currentDate = field.state.value ? new Date(field.state.value) : undefined

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
      <ResponsiveMenu>
        <ResponsiveMenuTrigger asChild>
          <Button
            className={cn(
              'w-full justify-start text-left font-normal',
              !field.state.value && 'text-muted-foreground',
              className,
            )}
            variant='outline'
          >
            <CalendarIcon className='mr-2 size-4' />
            {field.state.value ? (
              displayDateTime(new Date(field.state.value))
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </ResponsiveMenuTrigger>
        <ResponsiveMenuContent
          align='start'
          className='w-(--radix-popper-anchor-width) origin-top p-0'
        >
          <ResponsiveMenuLabel>
            {pipe(
              currentDate,
              Option.fromNullable,
              Option.match({
                onNone: () => 'Select Date and Time',
                onSome: displayDateTime,
              }),
            )}
          </ResponsiveMenuLabel>

          <ResponsiveMenuSeparator />

          <div className='flex flex-row gap-2 p-2'>
            <div>
              <Calendar
                initialFocus
                mode='single'
                onSelect={(date) => {
                  if (!date) {
                    field.handleChange(undefined)
                    return
                  }

                  const newDate = pipe(
                    currentDate,
                    Option.fromNullable,
                    Option.match({
                      onNone: () => date,
                      onSome: (current) =>
                        pipe(date, setHours(getHours(current)), setMinutes(getMinutes(current))),
                    }),
                  )

                  field.handleChange(getTime(newDate))
                }}
                selected={currentDate}
              />
            </div>
            <div className='space-y-1'>
              <div className='flex items-center px-2 pb-2'>
                <ClockIcon className='mr-2 size-4' />
                <span className='font-medium text-sm'>Time</span>
              </div>
              <div className='h-[300px] overflow-y-auto'>
                {timeOptions.map((timeOption) => (
                  <ResponsiveMenuItem
                    key={timeOption.label}
                    onClick={() => {
                      const newDate = pipe(
                        currentDate,
                        Option.fromNullable,
                        Option.match({
                          onNone: () => timeOption.value,
                          onSome: (current) =>
                            pipe(
                              current,
                              setHours(getHours(timeOption.value)),
                              setMinutes(getMinutes(timeOption.value)),
                            ),
                        }),
                      )

                      field.handleChange(getTime(newDate))
                    }}
                  >
                    {timeOption.label}
                  </ResponsiveMenuItem>
                ))}
              </div>
            </div>
          </div>
        </ResponsiveMenuContent>
      </ResponsiveMenu>
    </InputWrapper>
  )
}
