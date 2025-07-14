import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const StopCircleIcon = ({
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
    <circle cx={'12'} cy={'12'} r={'10'}></circle>
    <rect height={'6'} width={'6'} x={'9'} y={'9'}></rect>
  </svg>
)
StopCircleIcon.displayName = 'StopCircleIcon'
