import { CopyButton } from '@openfaith/ui/components/buttons/copyButton'
import { labelVariants } from '@openfaith/ui/components/ui/label'
import type { FC, ReactNode } from 'react'

type CopyDetailsProps = {
  value: string
  Label: ReactNode
}

export const CopyDetails: FC<CopyDetailsProps> = (props) => {
  const { value, Label } = props

  return (
    <div className='flex flex-col gap-1.5'>
      <span className={labelVariants()}>{Label}</span>

      <div className='flex w-auto flex-row items-center gap-2 self-start rounded-md bg-muted py-2 pr-2 pl-3'>
        <span className='text-primary/90 text-sm'>{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  )
}
