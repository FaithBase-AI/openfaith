'use client'

import { nullOp } from '@openfaith/shared'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@openfaith/ui/components/ui/dialog'
import { OtpForm } from '@openfaith/ui/form/otpForm'
import { Deferred, Effect, Option, pipe, Schema } from 'effect'
import type { ReactNode, Ref } from 'react'
import { useImperativeHandle, useRef, useState } from 'react'

export class OtpVerificationCancelledError extends Schema.TaggedError<OtpVerificationCancelledError>()(
  'OtpVerificationCancelledError',
  {
    reason: Schema.Literal('modal_closed'),
  },
) {}

export interface VerifyEmailOtpDialogRef {
  open: (email: string) => Effect.Effect<void, OtpVerificationCancelledError>
}

export interface VerifyEmailOtpDialogProps {
  ref?: Ref<VerifyEmailOtpDialogRef>
  title?: string
  description?: string
  submitLabel?: string
  autoSubmit?: boolean
  children?: ReactNode
}

export const VerifyEmailOtpDialog = (props: VerifyEmailOtpDialogProps) => {
  const {
    ref,
    title = 'Verify Your Email',
    description = 'Enter the verification code sent to your email address',
    submitLabel = 'Verify',
    autoSubmit = true,
    children,
  } = props

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const deferredRef = useRef<Deferred.Deferred<void, OtpVerificationCancelledError> | undefined>(
    undefined,
  )

  useImperativeHandle(
    ref,
    () => ({
      open: (emailToVerify: string) =>
        Effect.gen(function* () {
          // Create a new deferred for this verification session
          const deferred = yield* Deferred.make<void, OtpVerificationCancelledError>()

          // Store the deferred ref
          yield* Effect.sync(() => {
            deferredRef.current = deferred
            setEmail(emailToVerify)
            setOpen(true)
          })

          // Wait for the deferred to complete
          return yield* deferred
        }),
    }),
    [],
  )

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    // If closing and we have a pending deferred, fail it
    if (!newOpen && deferredRef.current) {
      Effect.runSync(
        Deferred.fail(
          deferredRef.current,
          new OtpVerificationCancelledError({ reason: 'modal_closed' }),
        ),
      )
      deferredRef.current = undefined
    }
  }

  const handleSuccess = () => {
    // Complete the deferred successfully
    if (deferredRef.current) {
      Effect.runSync(Deferred.succeed(deferredRef.current, undefined))
      deferredRef.current = undefined
    }
    setOpen(false)
    setEmail('')
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
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
          _tag='email-change'
          autoSubmit={autoSubmit}
          email={email}
          onSuccess={handleSuccess}
          submitLabel={submitLabel}
        />
      </DialogContent>
    </Dialog>
  )
}
