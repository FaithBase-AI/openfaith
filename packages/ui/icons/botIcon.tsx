import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const BotIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg
    ref={ref}
    width={'24'}
    height={'24'}
    viewBox={'0 0 24 24'}
    fill={'none'}
    stroke={'currentColor'}
    strokeWidth={'2'}
    strokeLinecap={'round'}
    strokeLinejoin={'round'}
    className={'lucide-icon customizable'}
    {...props}
  >
    <path d={'M12 8V4H8'} />
    <rect width={'16'} height={'12'} x={'4'} y={'8'} rx={'2'}></rect>
    <path d={'M2 14h2'} />
    <path d={'M20 14h2'} />
    <path d={'M15 13v2'} />
    <path d={'M9 13v2'} />
  </svg>
)
BotIcon.displayName = 'BotIcon'
