import { cn } from '@openfaith/ui/shared/utils'
import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'

type IconWrapperProps = HTMLAttributes<HTMLSpanElement> & { size?: number }

export const IconWrapper = forwardRef<HTMLSpanElement, IconWrapperProps>((props, ref) => {
  const { size = 4, className, children, ...domProps } = props

  return (
    <span className={cn(className, `[&>svg]:h-${size} [&>svg]:w-${size}`)} ref={ref} {...domProps}>
      {children}
    </span>
  )
})
IconWrapper.displayName = 'IconWrapper'
