import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChevronDownCircleIcon = ({
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
    <circle cx={'12'} cy={'12'} r={'10'} />
    <path d={'m16 10-4 4-4-4'} />
  </svg>
)
ChevronDownCircleIcon.displayName = 'ChevronDownCircleIcon'
