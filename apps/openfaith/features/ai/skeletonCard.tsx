import { Skeleton } from '@openfaith/ui'

export function SkeletonCard() {
  return (
    <div className='flex w-full flex-col space-y-2'>
      <div className='flex w-full items-center justify-center'>
        <Skeleton className='h-[28px] w-72 rounded-xl' />
      </div>
      <Skeleton className='h-[300px] w-full rounded-xl' />
      <div className='flex w-full items-center justify-center'>
        <Skeleton className='h-4 w-20' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-[450px]' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-[350px]' />
      </div>
    </div>
  )
}
