import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const Heading1Icon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={'M4 5V19'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M14 5V19'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M17 19H18.5M20 19H18.5M18.5 19V11L17 12'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M4 12L14 12'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
  </svg>
)
Heading1Icon.displayName = 'Heading1Icon'
