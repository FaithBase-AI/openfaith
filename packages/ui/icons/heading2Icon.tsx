import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const Heading2Icon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={'M3.5 5V19'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M13.5 5V19'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={
        'M20.5 19H16.5V18.6907C16.5 18.2521 16.5 18.0327 16.5865 17.8385C16.673 17.6443 16.836 17.4976 17.1621 17.2041L19.7671 14.8596C20.2336 14.4397 20.5 13.8416 20.5 13.214V13C20.5 11.8954 19.6046 11 18.5 11C17.3954 11 16.5 11.8954 16.5 13V13.4'
      }
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M3.5 12L13.5 12'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
  </svg>
)
Heading2Icon.displayName = 'Heading2Icon'
