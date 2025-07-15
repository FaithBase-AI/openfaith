import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChevronUpIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M4.73611 13.2419C4.42652 12.9667 4.39864 12.4927 4.67383 12.1831L9.43947 6.82173C9.58179 6.66162 9.78579 6.57001 10 6.57001C10.2143 6.57001 10.4183 6.66162 10.5606 6.82173L15.3262 12.1831C15.6014 12.4927 15.5735 12.9667 15.2639 13.2419C14.9543 13.5171 14.4803 13.4892 14.2051 13.1796L10 8.44891L5.79494 13.1796C5.51975 13.4892 5.0457 13.5171 4.73611 13.2419Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
  </svg>
)
ChevronUpIcon.displayName = 'ChevronUpIcon'
