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
            <Button asChild className='mt-6 self-start py-6 text-lg' size={'lg'}>
              <Link to='/sign-in'>Sign Up Today!</Link>
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
        Their are three different problems that I see with church software as a whole that I have
        set out to solve with OpenFaith.
        <br />
        1. Enable churches to spend more time on mission.
        <br />
        2. Make it really easy for others to build software for churches
        <br />
        3. Help churches focus on discipleship
        <br />
        <br />
        Church software has been stuck in the dark ages. For a long time, the church has gotten the
        sloppy seconds from the world. Silicon Valley isn't gonna build software for believers, they
        are at war with the Kingdom. I'm so grateful for those who have served the church, built
        tools for them, and served the bride. The problem is technology moves forward at a break
        neck pace. What was hot 5 years ago feels dated today. Churches have had their data held
        captive in old systems without a path forward. Data has been scattered in different products
        that don't sync with one another.
        <br />
        <br />
        The burden of administration for churches continues to grow. Managing Services, Teams,
        Groups, Donations, Kids Check-ins, People, Connect Cards, Classes, Conferences. It's like a
        new thing is added every couple of years, more new processes, more time spent managing data
        instead of discipling people.
        <br />
        <br />
        I've been building software for the church since 2019. I've seen the ups and downs, the
        problems that need solving. How churches have been held hostage by giving solutions, stuck
        on archaic databases with no path forward. It breaks my heart. The Lord started to speak to
        me in the spring of 2025 about building something new with all the knowledge I've gained
        from the last 6 years.
        <br />
        <br />
        He showed me a way of building a general tool that can talk to all the church software that
        has come before. This gives churches a path into modern software without the switching
        costs. You can still use your old software and use OpenFaith at the same time. All of your
        systems will stay in sync thanks to OpenFaiths powerful sync engine.
        <br />
        <br />
        OpenFaith is the fastest church software you have ever used. No more refreshing to see
        changes, everything is instant. 1 click to edit anything. Look at your data more like a
        spreadsheet than a list. Customize the columns you want to see for every data type. Filter
        instantly and save it as a view to share them with your team. View your church the way you
        want to see it.
        <br />
        <br />
        The other part of church software that has just confused me to no end is how they deny the
        foundations of ministry by excluding core features. If your church software doesn't let you
        mark that someone is saved, it's not church software. If it doesn't let you have a
        membership class that lets you gate what people can and can't do, it's not church software.
        <br />
        <br />
        The reality is, we have software for administration, but not software for discipleship.
        Jesus said that his house (church) will be known as a house of prayer. We have tools that
        let us put on a show each weekend, but cause us to miss the lost sheep. In our pursuit of
        excellence, we have lost the heart of ministry in our tools. I truly believe that we need a
        new wineskin of software to support the coming move of the Spirit that will bring revival to
        America and the ends of the earth.
        <br />
        <br />
        Increasing giving, helping plan services, enabling faster kids check-in are the money
        makers. I don't have a problem with this at face value. Our tools have turned us into
        pharisees. It's caused us to focus on the what over the who. My prayer with OpenFaith is to
        bring us back to the who, the people, the sheep, the lost souls.
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
