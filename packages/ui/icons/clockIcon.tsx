import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ClockIcon = ({
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
        'M10 4.25C10.4142 4.25 10.75 4.58579 10.75 5V9.53647L13.3354 10.8292C13.7059 11.0144 13.8561 11.4649 13.6708 11.8354C13.4856 12.2059 13.0351 12.3561 12.6646 12.1708L9.66459 10.6708C9.4105 10.5438 9.25 10.2841 9.25 10V5C9.25 4.58579 9.58579 4.25 10 4.25Z'
      }
      fill={'currentColor'}
    />
    <path
      fillRule={'evenodd'}
      clipRule={'evenodd'}
      d={
        'M10 18.5C14.6944 18.5 18.5 14.6944 18.5 10C18.5 5.30558 14.6944 1.5 10 1.5C5.30558 1.5 1.5 5.30558 1.5 10C1.5 14.6944 5.30558 18.5 10 18.5ZM10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
ClockIcon.displayName = 'ClockIcon'
