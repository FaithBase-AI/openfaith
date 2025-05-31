import { cn } from '@openfaith/ui/shared/utils'
import type { FC, HTMLAttributes } from 'react'

type InputErrorsProps = HTMLAttributes<HTMLParagraphElement>

export const InputErrors: FC<InputErrorsProps> = (props) => {
  const { children, className } = props

  return <p className={cn('text-destructive text-sm', className)}>{children}</p>
}
