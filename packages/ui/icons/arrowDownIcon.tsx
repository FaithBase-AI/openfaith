import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ArrowDownIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M15.249 10.3328C15.5577 10.6078 15.5855 11.0815 15.3111 11.3909L10.559 16.7484C10.417 16.9085 10.2136 17 10 17C9.78638 17 9.58295 16.9085 9.44103 16.7484L4.68891 11.3909C4.41451 11.0815 4.44231 10.6078 4.75102 10.3328C5.05973 10.0578 5.53244 10.0856 5.80685 10.395L9.25213 14.2793L9.25213 3.74947C9.25213 3.33555 9.58696 3 10 3C10.413 3 10.7479 3.33555 10.7479 3.74948L10.7479 14.2793L14.1932 10.395C14.4676 10.0856 14.9403 10.0578 15.249 10.3328Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
  </svg>
)
ArrowDownIcon.displayName = 'ArrowDownIcon'
