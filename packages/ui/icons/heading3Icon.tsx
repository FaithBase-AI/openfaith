import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const Heading3Icon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg ref={ref} width={'20'} height={'20'} viewBox={'0 0 24 24'} fill={'none'} {...props}>
    <path
      d={'M3.5 5V19'}
      stroke={'currentColor'}
      strokeWidth={'1.5'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path
      d={'M13.5 5V19'}
      stroke={'currentColor'}
      strokeWidth={'1.5'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path
      d={
        'M16.5 17C16.5 18.1046 17.3954 19 18.5 19C19.6046 19 20.5 18.1046 20.5 17C20.5 15.8954 19.6046 15 18.5 15C19.6046 15 20.5 14.1046 20.5 13C20.5 11.8954 19.6046 11 18.5 11C17.3954 11 16.5 11.8954 16.5 13'
      }
      stroke={'currentColor'}
      strokeWidth={'1.5'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path
      d={'M3.5 12L13.5 12'}
      stroke={'currentColor'}
      strokeWidth={'1.5'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
  </svg>
)
Heading3Icon.displayName = 'Heading3Icon'
