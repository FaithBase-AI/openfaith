import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ArrowUpIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M4.75102 9.66723C4.44231 9.39224 4.41451 8.91851 4.68891 8.60914L9.44103 3.25155C9.58295 3.09155 9.78638 3 10 3C10.2136 3 10.417 3.09155 10.559 3.25155L15.3111 8.60914C15.5855 8.91851 15.5577 9.39224 15.249 9.66723C14.9403 9.94223 14.4676 9.91436 14.1932 9.60499L10.7479 5.72074L10.7479 16.2505C10.7479 16.6644 10.413 17 10 17C9.58696 17 9.25213 16.6644 9.25213 16.2505L9.25213 5.72074L5.80685 9.60499C5.53244 9.91436 5.05973 9.94223 4.75102 9.66723Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
  </svg>
)
ArrowUpIcon.displayName = 'ArrowUpIcon'
