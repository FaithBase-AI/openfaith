import { cn } from '@openfaith/ui/shared/utils'
import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'

type IconWrapperProps = HTMLAttributes<HTMLSpanElement> & { size?: number }

export const IconWrapper = forwardRef<HTMLSpanElement, IconWrapperProps>((props, ref) => {
  const { size = 4, className, children, ...domProps } = props

  return (
    <span ref={ref} className={cn(className, `[&>svg]:h-${size} [&>svg]:w-${size}`)} {...domProps}>
      {children}
    </span>
  )
})
IconWrapper.displayName = 'IconWrapper'
