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
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentProps, FC, ReactNode } from 'react'

export const Route = createFileRoute('/_marketing/')({
  component: Home,
})

const cardClassName =
  'h-full w-full rounded-xl p-8 text-xl flex flex-col items-start justify-end font-semibold light:text-primary/80 dark:text-secondary/80 gap-4 [&_svg]:pointer-events-none [&_svg]:size-7 cursor-pointer hover:scale-101 transition-all grid-col-1'

const cardColors = {
  blue: 'bg-blue-200 hover:bg-blue-300/80 dark:hover:bg-blue-250',
  green: 'bg-green-200 hover:bg-green-300/80 dark:hover:bg-green-200/90',
  orange: 'bg-orange-200 hover:bg-orange-300/80 dark:hover:bg-orange-200/90',
  purple: 'bg-purple-200 hover:bg-purple-300/80 dark:hover:bg-purple-200/90',
  red: 'bg-red-200 hover:bg-red-300/80 dark:hover:bg-red-200/90',
  teal: 'bg-teal-200 hover:bg-teal-300/80 dark:hover:bg-teal-200/90',
  yellow: 'bg-yellow-200 hover:bg-yellow-300/80 dark:hover:bg-yellow-200/90',
}

const heroTextClassName =
  'text-balance font-bold text-4xl sm:text-[54px] md:text-[67px] lg:text-[68px] xl:text-7xl'

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
      <div className='grid-row grid w-full grid-cols-1 grid-rows-11 gap-2 sm:grid-cols-2 sm:grid-rows-7 md:grid-cols-3 md:grid-rows-6 lg:grid-cols-4 lg:grid-rows-4'>
        <div className='relative col-span-1 row-span-4 flex min-h-[min(660px,780dvh)] w-full flex-3 overflow-hidden rounded-xl rounded-tl-4xl rounded-tr-4xl bg-gradient-to-br from-emerald-800/40 to-emerald-700/20 sm:col-span-2 sm:row-span-3 md:col-span-3 lg:rounded-tr-xl lg:rounded-br-[40px]'>
          <div className='algin-start relative z-10 mx-auto my-auto mt-16 flex w-[calc(80%+16px)] flex-col justify-center px-4 xl:mt-16'>
            <TextEffect
              as='h1'
              className={heroTextClassName}
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
              className={heroTextClassName}
              delay={0.36}
              preset='fade-in-blur'
              speedSegment={0.3}
            >
              {/* At Your Finger tips */}
              {/* your flock */}
              built for tomorrow
            </TextEffect>
            <AnimatePresence mode='popLayout'>
              <motion.div
                animate={{
                  filter: 'blur(0px)',
                  opacity: 1,
                  transform: 'translateY(0) rotate(0)',
                  transformOrigin: 'left',
                  transition: {
                    delay: 0.69,
                    duration: 0.76,
                  },
                }}
                initial={{
                  filter: 'blur(12px)',
                  opacity: 0,
                  transform: 'translateY(20px) rotate(2deg)',
                  transformOrigin: 'left',
                }}
              >
                <Button asChild className='mt-6 self-start py-6 text-lg' size={'lg'}>
                  <Link to='/sign-in'>Sign Up Today!</Link>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className='absolute top-[50%] left-[50%] h-full w-[80%] translate-x-[-50%] rounded-xl border-8 border-neutral-300 bg-neutral-200' />
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
            'sm:rounded-br-4xl lg:rounded-tr-[40px] lg:rounded-br-xl',
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
    </div>
  )
}
