import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChevronDownIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M15.264 6.75949C15.5735 7.03468 15.6014 7.50874 15.3262 7.81832L10.5606 13.1797C10.4183 13.3398 10.2143 13.4314 10 13.4314C9.78581 13.4314 9.58181 13.3398 9.43948 13.1797L4.67384 7.81832C4.39865 7.50874 4.42654 7.03468 4.73613 6.75949C5.04571 6.48431 5.51977 6.51219 5.79496 6.82178L10 11.5525L14.2051 6.82178C14.4803 6.51219 14.9544 6.48431 15.264 6.75949Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
  </svg>
)
ChevronDownIcon.displayName = 'ChevronDownIcon'
