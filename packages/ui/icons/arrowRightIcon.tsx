import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ArrowRightIcon = ({
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
        'M10.3328 4.75102C10.6078 4.44231 11.0815 4.41451 11.3909 4.68891L16.7484 9.44103C16.9085 9.58295 17 9.78638 17 10C17 10.2136 16.9085 10.417 16.7484 10.559L11.3909 15.3111C11.0815 15.5855 10.6078 15.5577 10.3328 15.249C10.0578 14.9403 10.0856 14.4676 10.395 14.1932L14.2793 10.7479H3.74948C3.33555 10.7479 3 10.413 3 10C3 9.58696 3.33555 9.25213 3.74948 9.25213H14.2793L10.395 5.80685C10.0856 5.53244 10.0578 5.05973 10.3328 4.75102Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
ArrowRightIcon.displayName = 'ArrowRightIcon'
