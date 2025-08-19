'use client'

import { nullOp } from '@openfaith/shared'
import { OtpForm } from '@openfaith/ui/form/otpForm'
import { Option, pipe } from 'effect'
import type { FC, ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'

export type VerifyEmailOtpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel?: string
  autoSubmit?: boolean
  onSuccess?: () => void
  email: string
  children?: ReactNode
}

export const VerifyEmailOtpDialog: FC<VerifyEmailOtpDialogProps> = (props) => {
  const {
    open,
    onOpenChange,
    title,
    description,
    submitLabel = 'Verify',
    autoSubmit = true,
    onSuccess = nullOp,
    email,
    children,
  } = props

  const handleSuccess = () => {
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {children}
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {pipe(
              email,
              Option.fromNullable,
              Option.match({
                onNone: nullOp,
                onSome: (e) => (
                  <>
                    <br />
                    <span className='font-medium'>{e}</span>
                  </>
                ),
              }),
            )}
          </DialogDescription>
        </DialogHeader>
        <OtpForm
          _tag='verify-email'
          autoSubmit={autoSubmit}
          email={email}
          onSuccess={handleSuccess}
          submitLabel={submitLabel}
        />
      </DialogContent>
    </Dialog>
  )
}
