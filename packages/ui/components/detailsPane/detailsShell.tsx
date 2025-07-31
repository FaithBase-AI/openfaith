import { Separator } from '@openfaith/ui/components/ui/separator'
import type { FC, ReactNode } from 'react'

type DetailsShellProps = {
  topBarButtons: ReactNode
  header: ReactNode
  tabBar: ReactNode
  content: ReactNode
}

export const DetailsShell: FC<DetailsShellProps> = (props) => {
  const { topBarButtons, header, tabBar, content } = props

  return (
    <div className='flex h-full flex-col'>
      <div className='flex h-[55px] flex-row items-center justify-between px-4'>
        <div className='flex flex-row items-center gap-2'>{topBarButtons}</div>
      </div>

      <Separator />

      <div className='flex h-full flex-col overflow-hidden px-4 pt-4'>
        <div className='mb-4 flex flex-row items-center px-2'>{header}</div>

        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='flex flex-row gap-1.5 px-2'>{tabBar}</div>

          {content}
        </div>
      </div>
    </div>
  )
}
