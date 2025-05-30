import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ArrowUpDownIcon = ({
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
    <path d={'m21 16-4 4-4-4'} />
    <path d={'M17 20V4'} />
    <path d={'m3 8 4-4 4 4'} />
    <path d={'M7 4v16'} />
  </svg>
)
ArrowUpDownIcon.displayName = 'ArrowUpDownIcon'
