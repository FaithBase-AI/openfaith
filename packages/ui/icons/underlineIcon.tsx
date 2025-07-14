import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const UnderlineIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={'M5.5 3V11.5C5.5 15.0899 8.41015 18 12 18C15.5899 18 18.5 15.0899 18.5 11.5V3'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path d={'M3 21H21'} stroke={'currentColor'} strokeLinecap={'round'} strokeWidth={'1.5'} />
  </svg>
)
UnderlineIcon.displayName = 'UnderlineIcon'
