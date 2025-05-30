import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const UnderlineIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg ref={ref} width={'20'} height={'20'} viewBox={'0 0 24 24'} fill={'none'} {...props}>
    <path
      d={'M5.5 3V11.5C5.5 15.0899 8.41015 18 12 18C15.5899 18 18.5 15.0899 18.5 11.5V3'}
      stroke={'currentColor'}
      strokeWidth={'1.5'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path d={'M3 21H21'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
  </svg>
)
UnderlineIcon.displayName = 'UnderlineIcon'
