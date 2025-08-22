import { cn } from '@openfaith/ui'
import { Array, Boolean, pipe } from 'effect'
import type { FC, HTMLAttributes } from 'react'

type OnboardingProgressProps = HTMLAttributes<HTMLDivElement> & {
  totalSteps: number
  currentStep: number
}

export const OnboardingProgress: FC<OnboardingProgressProps> = (props) => {
  const { totalSteps, currentStep, className, ...domProps } = props

  return (
    <div className={cn('flex flex-row items-center justify-center gap-2', className)} {...domProps}>
      {pipe(
        Array.makeBy(totalSteps, (i) => i + 1),
        Array.map((x) => (
          <ProgressItem isActive={x === currentStep} isCompleted={x < currentStep} key={x} />
        )),
      )}
    </div>
  )
}

type ProgressItemProps = {
  isCompleted: boolean
  isActive: boolean
}

const ProgressItem = (props: ProgressItemProps) => {
  const { isCompleted, isActive } = props

  return (
    <div
      className={cn(
        'h-2.5 rounded-full border',
        pipe(
          isCompleted || isActive,
          Boolean.match({
            onFalse: () => 'border-neutral-300 bg-neutral-200',
            onTrue: () => 'border-emerald-600 bg-linear-to-b from-emerald-400 to-emerald-500',
          }),
        ),
        pipe(
          isActive,
          Boolean.match({
            onFalse: () => 'w-2.5',
            onTrue: () => 'w-10 ring-2 ring-emerald-300',
          }),
        ),
      )}
    />
  )
}
