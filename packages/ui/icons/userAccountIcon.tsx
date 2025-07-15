import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const UserAccountIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={'M14 8.99988H18'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M14 12.4999H17'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeWidth={'1.5'}
    />
    <rect
      height={'18'}
      rx={'5'}
      stroke={'currentColor'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
      width={'20'}
      x={'2'}
      y={'2.99988'}
    />
    <path
      d={'M5 15.9999C6.20831 13.4188 10.7122 13.249 12 15.9999'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={
        'M10.5 8.99988C10.5 10.1044 9.60457 10.9999 8.5 10.9999C7.39543 10.9999 6.5 10.1044 6.5 8.99988C6.5 7.89531 7.39543 6.99988 8.5 6.99988C9.60457 6.99988 10.5 7.89531 10.5 8.99988Z'
      }
      stroke={'currentColor'}
      strokeWidth={'1.5'}
    />
  </svg>
)
UserAccountIcon.displayName = 'UserAccountIcon'
