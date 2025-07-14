import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ArrowUpDownIcon = ({
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
    <path d={'m21 16-4 4-4-4'} />
    <path d={'M17 20V4'} />
    <path d={'m3 8 4-4 4 4'} />
    <path d={'M7 4v16'} />
  </svg>
)
ArrowUpDownIcon.displayName = 'ArrowUpDownIcon'
