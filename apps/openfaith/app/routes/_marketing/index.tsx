import {
  Button,
  cn,
  EditIcon,
  FilterIcon,
  LeaderIcon,
  LinkIcon,
  PlanningCenterIcon,
  TextEffect,
  TextFontIcon,
  ViewListIcon,
} from '@openfaith/ui'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/')({
  component: Home,
})

const cardClassName =
  'h-full w-full rounded-2xl p-8 text-xl flex flex-col items-start justify-end font-semibold text-primary/80 gap-4 [&_svg]:pointer-events-none [&_svg]:size-8'

function Home() {
  return (
    <div className='flex flex-col items-start gap-4 pb-4'>
      <div className='grid-row sm:grid-col-2 grid w-full grid-cols-1 grid-rows-11 gap-2 sm:grid-rows-7 md:grid-cols-3 md:grid-rows-6 lg:grid-cols-4 lg:grid-rows-4'>
        <div className='relative col-span-1 row-span-4 flex min-h-[660px] w-full flex-3 overflow-hidden rounded-2xl rounded-tl-4xl rounded-tr-4xl bg-gradient-to-br from-emerald-800/40 to-emerald-700/20 sm:col-span-2 sm:row-span-3 md:col-span-3 lg:rounded-tr-2xl lg:rounded-br-[40px]'>
          <div className='algin-start relative z-10 mx-auto my-auto mt-[30%] flex flex-col justify-center px-4 sm:mt-[20%] md:mt-[12%]'>
            <TextEffect
              as='h1'
              className='text-balance font-bold text-4xl sm:text-6xl md:text-7xl'
              delay={0.1}
              preset='fade-in-blur'
              speedSegment={0.3}
            >
              {/* Your Church Data */}
              {/* Tools to disciple */}
              Church software
            </TextEffect>
            <TextEffect
              as='h1'
              className='text-balance font-bold text-4xl sm:text-6xl md:text-7xl'
              delay={0.36}
              preset='fade-in-blur'
              speedSegment={0.3}
            >
              {/* At Your Finger tips */}
              {/* your flock */}
              built for tomorrow
            </TextEffect>
          </div>
          <div className='absolute top-[50%] left-[50%] h-full w-[80%] translate-x-[-50%] rounded-2xl border-8 border-neutral-300 bg-neutral-200' />
        </div>
        <div className={cn(cardClassName, 'bg-red-200 lg:rounded-tr-4xl')}>
          <ViewListIcon />
          See all your data at once
        </div>
        <div className={cn(cardClassName, 'bg-green-200')}>
          <EditIcon /> Edit anything in 1 click
        </div>
        <div className={cn(cardClassName, 'bg-yellow-200 lg:rounded-bl-[40px]')}>
          <FilterIcon /> Filter to your hearts content
        </div>
        <div className={cn(cardClassName, 'bg-blue-200 lg:rounded-bl-4xl')}>
          <PlanningCenterIcon />
          Live sync to Planning Center
        </div>
        <div className={cn(cardClassName, 'bg-orange-200')}>
          <TextFontIcon />
          Custom fields for all your data
        </div>
        <div
          className={cn(
            cardClassName,
            'bg-purple-200 sm:rounded-br-[40px] lg:rounded-tr-[40px] lg:rounded-br-2xl',
          )}
        >
          <LinkIcon />
          Link anything to anything
        </div>
        <div className={cn(cardClassName, 'rounded-b-4xl bg-teal-200 lg:rounded-tl-[40px]')}>
          <LeaderIcon />
          Tools to make disciples
        </div>
      </div>

      <h1 className='font-bold text-4xl'>OpenFaith</h1>

      <p className='text-gray-600 text-lg dark:text-gray-400'>
        The platform for managing your church's data.
        <br />
        <br />
        1. We work with Planning Center, but will work with other ChMS's soon.
        <br />
        2. Everything is a spreadsheet, just like Airtable.
        <br />
        3. AI is coming soon, but what we have today should blow you away.
        <br />
        <br />
        Just login, sync with Planning Center, and see your data come to life.
      </p>

      <Button asChild>
        <Link to='/sign-in'>Login</Link>
      </Button>
    </div>
  )
}
