import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ArrowUpRightIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M6.52368 6.05312C6.49984 5.64038 6.81515 5.28574 7.22795 5.26102L14.3766 4.83289C14.5901 4.8201 14.7987 4.89921 14.9497 5.05026C15.1008 5.20131 15.1799 5.40989 15.1671 5.62338L14.739 12.772C14.7142 13.1848 14.3596 13.5001 13.9469 13.4763C13.5341 13.4525 13.2196 13.0985 13.2443 12.6857L13.5547 7.50294L6.109 14.9486C5.81632 15.2413 5.34228 15.2418 5.05022 14.9498C4.75816 14.6577 4.75867 14.1837 5.05135 13.891L12.497 6.44529L7.31427 6.75569C6.90148 6.78041 6.54752 6.46586 6.52368 6.05312Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
  </svg>
)
ArrowUpRightIcon.displayName = 'ArrowUpRightIcon'
