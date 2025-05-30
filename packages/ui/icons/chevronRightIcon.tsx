import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChevronRightIcon = ({
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
        'M6.75881 4.73678C7.034 4.42719 7.50805 4.39931 7.81764 4.6745L13.179 9.44014C13.3391 9.58246 13.4307 9.78647 13.4307 10.0007C13.4307 10.2149 13.3391 10.4189 13.179 10.5613L7.81764 15.3269C7.50805 15.6021 7.034 15.5742 6.75881 15.2646C6.48362 14.955 6.51151 14.481 6.82109 14.2058L11.5518 10.0007L6.82109 5.79561C6.5115 5.52042 6.48362 5.04637 6.75881 4.73678Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
ChevronRightIcon.displayName = 'ChevronRightIcon'
