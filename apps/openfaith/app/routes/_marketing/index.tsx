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
} from '@openfaith/ui'
import { createFileRoute, Link, type LinkComponentProps } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'

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

type FeatureCardProps = LinkComponentProps & {
  Icon: ReactNode
  Tagline: ReactNode
}

const FeatureCard: FC<FeatureCardProps> = (props) => {
  const { Icon, Tagline, className, ...domProps } = props

  return (
    <Link className={cn(cardClassName, className)} {...domProps}>
      {Icon}
      <span className={'inline-flex items-end gap-1'}>
        {Tagline} <ArrowRightIcon className={`size-6`} />
      </span>
    </Link>
  )
}

function Home() {
  const { resolvedTheme } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)

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
          to={'/features#see-your-data' as '/features'}
        />
        <FeatureCard
          className={cardColors.green}
          Icon={<EditIcon />}
          Tagline={'Edit anything in 1 click'}
          to={'/features#edit-anything' as '/features'}
        />
        <FeatureCard
          className={cn(cardColors.yellow, 'lg:rounded-bl-[40px]')}
          Icon={<FilterIcon />}
          Tagline={'Filter to your hearts content'}
          to={'/features#filter-everything' as '/features'}
        />
        <FeatureCard
          className={cn(cardColors.blue, 'lg:rounded-bl-4xl')}
          Icon={<PlanningCenterIcon />}
          Tagline={'Live sync to Planning Center'}
          to={'/features#pco-sync' as '/features'}
        />
        <FeatureCard
          className={cardColors.orange}
          Icon={<TextFontIcon />}
          Tagline={'Custom fields for all your data'}
          to={'/features#custom-fields' as '/features'}
        />
        <FeatureCard
          className={cn(
            cardColors.purple,
            'sm:rounded-br-4xl lg:rounded-tr-[40px] lg:rounded-br-xl',
          )}
          Icon={<LinkIcon />}
          Tagline={'Link anything to anything'}
          to={'/features#link-anything' as '/features'}
        />
        <FeatureCard
          className={cn(cardColors.teal, 'rounded-b-4xl lg:rounded-tl-[40px]')}
          Icon={<LeaderIcon />}
          Tagline={'Tools to make disciples'}
          to={'/features#discipleship' as '/features'}
        />
      </div>

      <div className='relative aspect-[600/407] w-full overflow-hidden rounded-4xl bg-neutral-200 dark:bg-neutral-800'>
        {!isPlaying ? (
          <button
            className='group absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center'
            onClick={() => {
              setIsPlaying(true)
            }}
            type='button'
          >
            <img
              alt='Video thumbnail'
              className='absolute inset-0 h-full w-full object-cover'
              src='https://img.youtube.com/vi/vJMmHQqigGc/maxresdefault.jpg'
            />
            <div className='absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30' />
            <svg
              className='relative z-10 size-20 text-white transition-transform group-hover:scale-110'
              fill='currentColor'
              viewBox='0 0 68 48'
            >
              <path d='M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z' />
              <path d='M 45,24 27,14 27,34' fill='#000' />
            </svg>
          </button>
        ) : (
          <iframe
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            className='absolute inset-0 h-full w-full'
            src={`https://www.youtube.com/embed/vJMmHQqigGc?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&color=${resolvedTheme === 'dark' ? 'white' : 'black'}`}
            title='OpenFaith Video'
          />
        )}
      </div>
    </div>
  )
}
