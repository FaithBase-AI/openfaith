import { Logo } from '@openfaith/openfaith/components/logo'
import { Loader2Icon } from '@openfaith/ui'
import type { FC } from 'react'

export const AppLoading: FC = () => (
  <div
    className={
      'absolute top-0 right-0 bottom-0 left-0 flex h-[max(-webkit-fill-available,100vh)] w-full items-center justify-center'
    }
  >
    <div className={'relative z-10 h-32 w-32 overflow-hidden rounded-full bg-background'}>
      <Logo className={'h-32 w-32'} />
    </div>
    <div
      className={'absolute top-[50%] left-[50%] h-40 w-40 translate-x-[-50%] translate-y-[-50%]'}
    >
      <Loader2Icon className={'h-40 w-40 animate-spin text-primary'} />
    </div>
  </div>
)
