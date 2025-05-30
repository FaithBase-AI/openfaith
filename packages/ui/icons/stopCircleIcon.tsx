import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const StopCircleIcon = ({
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
    <circle cx={'12'} cy={'12'} r={'10'}></circle>
    <rect width={'6'} height={'6'} x={'9'} y={'9'}></rect>
  </svg>
)
StopCircleIcon.displayName = 'StopCircleIcon'
