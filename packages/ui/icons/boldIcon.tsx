import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const BoldIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M5 6C5 4.58579 5 3.87868 5.43934 3.43934C5.87868 3 6.58579 3 8 3H12.5789C15.0206 3 17 5.01472 17 7.5C17 9.98528 15.0206 12 12.5789 12H5V6Z'
      }
      fillRule={'evenodd'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={
        'M12.4286 12H13.6667C16.0599 12 18 14.0147 18 16.5C18 18.9853 16.0599 21 13.6667 21H8C6.58579 21 5.87868 21 5.43934 20.5607C5 20.1213 5 19.4142 5 18V12'
      }
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
  </svg>
)
BoldIcon.displayName = 'BoldIcon'
