import {
  cn,
  IconWrapper,
  PlanningCenterIcon,
  PushpayIcon,
  RockRmsIcon,
  SubsplashIcon,
  TithelyIcon,
} from '@openfaith/ui'
import type { ComponentProps, FC, ReactNode } from 'react'

type BaseChmsBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  iconClassName?: string
  nameClassName?: string
}

type ChmsBadgeProps = BaseChmsBadgeProps & {
  Icon: ReactNode
  Name: ReactNode
}

const ChmsBadge: FC<ChmsBadgeProps> = (props) => {
  const { className, iconClassName, nameClassName, Icon, Name } = props

  return (
    <span
      className={cn(
        'ml-1 inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-2xl bg-gray-200 pr-2 pl-1',
        className,
      )}
    >
      <IconWrapper className={cn('ml-1 inline-block', iconClassName)} size={4}>
        {Icon}
      </IconWrapper>
      <span className={cn('-mt-0 ml-1 font-semibold text-lg', nameClassName)}>{Name}</span>
    </span>
  )
}

export const PcoBadge: FC<BaseChmsBadgeProps> = (props) => {
  return <ChmsBadge {...props} Icon={<PlanningCenterIcon />} Name='Planning Center' />
}

export const CcbBadge: FC<BaseChmsBadgeProps> = (props) => {
  return <ChmsBadge {...props} Icon={<PushpayIcon />} Name='Church Community Builder' />
}

export const RockRmsBadge: FC<BaseChmsBadgeProps> = (props) => {
  return <ChmsBadge {...props} Icon={<RockRmsIcon />} Name='Rock RMS' />
}

export const TithelyBadge: FC<BaseChmsBadgeProps> = (props) => {
  return <ChmsBadge {...props} Icon={<TithelyIcon />} Name='Tithely' />
}

export const SubsplashBadge: FC<BaseChmsBadgeProps> = (props) => {
  return <ChmsBadge {...props} Icon={<SubsplashIcon />} Name='Subsplash' />
}
