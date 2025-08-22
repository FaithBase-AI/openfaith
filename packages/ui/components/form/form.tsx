import { FormErrorDisplay } from '@openfaith/ui/components/form/formErrorDisplay'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, Match, Option, pipe } from 'effect'
import type { FC, HTMLProps, ReactNode } from 'react'

export type FormStateWithErrorMap = {
  errorMap: {
    onSubmit?: unknown
    onBlur?: unknown
    onChange?: unknown
    onMount?: unknown
    onServer?: unknown
  }
}

type FormProps = Omit<HTMLProps<HTMLFormElement>, 'form'> & {
  form: {
    handleSubmit: () => void
    Subscribe: <TSelected = FormStateWithErrorMap>(props: {
      selector: (state: FormStateWithErrorMap) => TSelected
      children: (state: TSelected) => ReactNode
    }) => ReactNode
  }
}

export const Form: FC<FormProps> = (props) => {
  const { form, children, className, ...domProps } = props

  return (
    <form
      className={cn('flex flex-col gap-4', className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      {...domProps}
    >
      <FormErrorDisplay form={form} />
      {children}

      <input hidden type='submit' />
    </form>
  )
}

export const getSubmitButtonText = (
  params:
    | {
        _tag: 'create'
      }
    | {
        _tag: 'edit'
        clone?: boolean
      },
) =>
  pipe(
    Match.type<typeof params>(),
    Match.tag('create', () => 'Create'),
    Match.tag('edit', (y) =>
      pipe(
        y.clone,
        Option.fromNullable,
        Option.getOrElse(() => false),
        Boolean.match({
          onFalse: () => 'Update',
          onTrue: () => 'Clone',
        }),
      ),
    ),
    Match.exhaustive,
  )(params)
