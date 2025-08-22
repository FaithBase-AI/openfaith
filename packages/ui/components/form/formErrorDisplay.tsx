'use client'

import { nullOp } from '@openfaith/shared'
import { AlertCircleIcon } from '@openfaith/ui/icons/alertCircleIcon'
import { Option, pipe } from 'effect'
import type { FC, ReactNode } from 'react'

type ErrorMap = {
  // It's actually { form: unknown }
  onSubmit?: unknown
  onBlur?: unknown
  onChange?: unknown
  onMount?: unknown
  onServer?: unknown
}

type FormStateWithErrorMap = {
  errorMap: ErrorMap
}

type FormErrorDisplayProps = {
  form: {
    Subscribe: <TSelected = FormStateWithErrorMap>(props: {
      selector: (state: FormStateWithErrorMap) => TSelected
      children: (state: TSelected) => ReactNode
    }) => ReactNode
  }
}

export const FormErrorDisplay: FC<FormErrorDisplayProps> = (props) => {
  const { form } = props

  return (
    <form.Subscribe selector={(state) => state.errorMap}>
      {(errorMap: ErrorMap) =>
        pipe(
          Option.fromNullable(errorMap.onSubmit),
          Option.flatMap((error) => {
            if ('form' in error && typeof error.form === 'string') {
              return Option.some(error.form)
            }
            return Option.none()
          }),
          Option.match({
            onNone: nullOp,
            onSome: (errorMessage) => (
              <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-4'>
                <div className='flex items-start'>
                  <AlertCircleIcon className='h-5 w-5 text-red-400' />
                  <div className='ml-3 flex-1'>
                    <p className='text-red-700 text-sm'>{errorMessage}</p>
                  </div>
                </div>
              </div>
            ),
          }),
        )
      }
    </form.Subscribe>
  )
}
