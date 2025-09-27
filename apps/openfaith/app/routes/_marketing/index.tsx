import {
  ArrowRightIcon,
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
  YouTubeIcon,
} from '@openfaith/ui'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ComponentProps, FC, ReactNode } from 'react'

export const Route = createFileRoute('/_marketing/')({
  component: Home,
})

const cardClassName =
  'h-full w-full rounded-2xl p-8 text-xl flex flex-col items-start justify-end font-semibold light:text-primary/80 dark:text-secondary/80 gap-4 [&_svg]:pointer-events-none [&_svg]:size-8 cursor-pointer hover:scale-101 transition-all'

const cardColors = {
  blue: 'bg-blue-200 hover:bg-blue-300/80 dark:hover:bg-blue-250',
  green: 'bg-green-200 hover:bg-green-300/80 dark:hover:bg-green-200/90',
  orange: 'bg-orange-200 hover:bg-orange-300/80 dark:hover:bg-orange-200/90',
  purple: 'bg-purple-200 hover:bg-purple-300/80 dark:hover:bg-purple-200/90',
  red: 'bg-red-200 hover:bg-red-300/80 dark:hover:bg-red-200/90',
  teal: 'bg-teal-200 hover:bg-teal-300/80 dark:hover:bg-teal-200/90',
  yellow: 'bg-yellow-200 hover:bg-yellow-300/80 dark:hover:bg-yellow-200/90',
}

type FeatureCardProps = ComponentProps<'div'> & {
  Icon: ReactNode
  Tagline: ReactNode
}

const FeatureCard: FC<FeatureCardProps> = (props) => {
  const { Icon, Tagline, className, ...domProps } = props

  return (
    <div className={cn(cardClassName, className)} {...domProps}>
      {Icon}
      <span className={'inline-flex items-end gap-1'}>
        {Tagline} <ArrowRightIcon className={`size-6`} />
      </span>
    </div>
  )
}

function Home() {
  return (
    <div className='flex flex-col items-start gap-4 pb-4'>
      <div className='grid-row sm:grid-col-2 grid w-full grid-cols-1 grid-rows-11 gap-2 sm:grid-rows-7 md:grid-cols-3 md:grid-rows-6 lg:grid-cols-4 lg:grid-rows-4'>
        <div className='relative col-span-1 row-span-4 flex min-h-[660px] w-full flex-3 overflow-hidden rounded-2xl rounded-tl-4xl rounded-tr-4xl bg-gradient-to-br from-emerald-800/40 to-emerald-700/20 sm:col-span-2 sm:row-span-3 md:col-span-3 lg:rounded-tr-2xl lg:rounded-br-[40px]'>
          <div className='algin-start relative z-10 mx-auto my-auto mt-[30%] flex w-[calc(80%+16px)] flex-col justify-center px-4 sm:mt-[20%] md:mt-[8%]'>
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
            <Button className='mt-6 self-start py-6 text-lg' size={'lg'}>
              Sign Up Today!
            </Button>
          </div>
          <div className='absolute top-[50%] left-[50%] h-full w-[80%] translate-x-[-50%] rounded-2xl border-8 border-neutral-300 bg-neutral-200' />
        </div>
        <FeatureCard
          className={cn(cardColors.red, 'lg:rounded-tr-4xl')}
          Icon={<ViewListIcon />}
          Tagline={'See all your data at once'}
        />
        <FeatureCard
          className={cardColors.green}
          Icon={<EditIcon />}
          Tagline={'Edit anything in 1 click'}
        />
        <FeatureCard
          className={cn(cardColors.yellow, 'lg:rounded-bl-[40px]')}
          Icon={<FilterIcon />}
          Tagline={'Filter to your hearts content'}
        />
        <FeatureCard
          className={cn(cardColors.blue, 'lg:rounded-bl-4xl')}
          Icon={<PlanningCenterIcon />}
          Tagline={'Live sync to Planning Center'}
        />
        <FeatureCard
          className={cardColors.orange}
          Icon={<TextFontIcon />}
          Tagline={'Custom fields for all your data'}
        />
        <FeatureCard
          className={cn(
            cardColors.purple,
            'sm:rounded-br-[40px] lg:rounded-tr-[40px] lg:rounded-br-2xl',
          )}
          Icon={<LinkIcon />}
          Tagline={'Link anything to anything'}
        />
        <FeatureCard
          className={cn(cardColors.teal, 'rounded-b-4xl lg:rounded-tl-[40px]')}
          Icon={<LeaderIcon />}
          Tagline={'Tools to make disciples'}
        />
      </div>

      <div className='flex aspect-video w-full items-center justify-center rounded-4xl bg-neutral-200 dark:bg-neutral-800'>
        <YouTubeIcon className='size-12 opacity-40' />
      </div>

      <h1 className='font-bold text-4xl'>OpenFaith</h1>

      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        Church software has been stuck in the dark ages. Silicon Valley isn't gonna build software
        for believers, they are at war with the Kingdom. For a long time, the church has gotten the
        sloppy seconds. I'm so grateful for those who have served the church, built tools for them,
        and served the bride. The problem is technology moves forward at a break neck pace. What was
        hot 5 years ago feels dated today.
      </p>
      <p className='text-gray-600 text-lg dark:text-gray-300'>
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
