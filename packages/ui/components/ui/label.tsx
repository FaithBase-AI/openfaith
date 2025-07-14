'use client'

import { nullOp } from '@openfaith/shared'
import { cn } from '@openfaith/ui/shared/utils'
import { cva } from 'class-variance-authority'
import { Boolean, pipe } from 'effect'
import { Label as LabelPrimitive } from 'radix-ui'

const labelVariants = cva(
  'flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
)

function Label({
  className,
  required = false,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  return (
    <LabelPrimitive.Root className={cn(labelVariants(), className)} data-slot='label' {...props}>
      {children}
      {pipe(required, Boolean.match({ onFalse: nullOp, onTrue: () => '*' }))}
    </LabelPrimitive.Root>
  )
}

export { Label }
