import { Divider } from '@openfaith/ui/components/ui/divider'
import { MainContainer } from '@openfaith/ui/components/ui/pageComponents'
import { PageHeaderContainer } from '@openfaith/ui/components/ui/pageHeader'
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
    <MainContainer>
      <PageHeaderContainer className={'h-[55px] px-4'}>
        <div className={'flex flex-row items-center gap-2'}>{topBarButtons}</div>
      </PageHeaderContainer>

      <Divider variant={'modal'} />

      <div className={'flex h-full flex-col overflow-hidden px-6 pt-4'}>
        <div className={'mb-4 flex flex-row items-center'}>{header}</div>

        <div className={'flex flex-1 flex-col overflow-hidden'}>
          <div className={'flex flex-row gap-1.5'}>{tabBar}</div>

          {content}
        </div>
      </div>
    </MainContainer>
  )
}
