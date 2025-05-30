import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChevronsUpDownIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg width={'20'} height={'20'} viewBox={'0 0 20 20'} {...props}>
    <path
      fillRule={'evenodd'}
      clipRule={'evenodd'}
      d={
        'M4.73613 8.66702C4.42654 8.39183 4.39865 7.91778 4.67384 7.60819L9.43948 2.24684C9.58181 2.08673 9.78581 1.99512 10 1.99512C10.2143 1.99512 10.4183 2.08673 10.5606 2.24684L15.3262 7.60819C15.6014 7.91777 15.5735 8.39183 15.2639 8.66702C14.9544 8.94221 14.4803 8.91432 14.2051 8.60473L10 3.87402L5.79495 8.60473C5.51977 8.91432 5.04571 8.94221 4.73613 8.66702Z'
      }
      fill={'currentColor'}
    />
    <path
      fillRule={'evenodd'}
      clipRule={'evenodd'}
      d={
        'M15.264 11.333C15.5735 11.6082 15.6014 12.0822 15.3262 12.3918L10.5606 17.7532C10.4183 17.9133 10.2143 18.0049 10 18.0049C9.78581 18.0049 9.58181 17.9133 9.43948 17.7532L4.67384 12.3918C4.39865 12.0822 4.42654 11.6082 4.73613 11.333C5.04571 11.0578 5.51977 11.0857 5.79496 11.3953L10 16.126L14.2051 11.3953C14.4803 11.0857 14.9544 11.0578 15.264 11.333Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
ChevronsUpDownIcon.displayName = 'ChevronsUpDownIcon'
