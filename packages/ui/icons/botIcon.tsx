import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const BotIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg
    className={'lucide-icon customizable'}
    fill={'none'}
    height={'24'}
    ref={ref}
    stroke={'currentColor'}
    strokeLinecap={'round'}
    strokeLinejoin={'round'}
    strokeWidth={'2'}
    viewBox={'0 0 24 24'}
    width={'24'}
    {...props}
  >
    <path d={'M12 8V4H8'} />
    <rect height={'12'} rx={'2'} width={'16'} x={'4'} y={'8'}></rect>
    <path d={'M2 14h2'} />
    <path d={'M20 14h2'} />
    <path d={'M15 13v2'} />
    <path d={'M9 13v2'} />
  </svg>
)
BotIcon.displayName = 'BotIcon'
