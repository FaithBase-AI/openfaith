import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, Match, Option, pipe } from 'effect'
import type { FC, HTMLProps } from 'react'

type FormProps = Omit<HTMLProps<HTMLFormElement>, 'form'> & {
  form: {
    handleSubmit: () => void
  }
}

export const Form: FC<FormProps> = (props) => {
  const { form, children, className, ...domProps } = props

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      className={cn('flex flex-col gap-4', className)}
      {...domProps}
    >
      {children}

      <input type='submit' hidden />
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
