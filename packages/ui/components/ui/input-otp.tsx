'use client'

import { MinusIcon } from '@openfaith/ui/icons/minusIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { OTPInput, OTPInputContext } from 'input-otp'
import type { ComponentProps } from 'react'
import { useContext } from 'react'

function InputOTP({
  className,
  containerClassName,
  ...props
}: ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      className={cn('disabled:cursor-not-allowed', className)}
      containerClassName={cn('flex items-center gap-2 has-disabled:opacity-50', containerClassName)}
      data-1p-ignore
      data-slot='input-otp'
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center', className)} data-slot='input-otp-group' {...props} />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: ComponentProps<'div'> & {
  index: number
}) {
  const inputOTPContext = useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      className={cn(
        'relative flex h-9 w-9 items-center justify-center border-input border-y border-r text-sm shadow-xs outline-none transition-all first:rounded-l-md first:border-l last:rounded-r-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40',
        className,
      )}
      data-active={isActive}
      data-slot='input-otp-slot'
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='h-4 w-px animate-caret-blink bg-foreground duration-1000' />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: ComponentProps<'div'>) {
  return (
    // biome-ignore lint/a11y/useFocusableInteractive: this is the way
    // biome-ignore lint/a11y/useSemanticElements: this is the way
    // biome-ignore lint/a11y/useAriaPropsForRole: this is the way
    <div data-slot='input-otp-separator' role='separator' {...props}>
      <MinusIcon />
    </div>
  )
}
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot }
