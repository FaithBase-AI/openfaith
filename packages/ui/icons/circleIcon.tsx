import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const CircleIcon = ({
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
        'M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1ZM2.51285 10C2.51285 5.86496 5.86496 2.51285 10 2.51285C14.135 2.51285 17.4872 5.86496 17.4872 10C17.4872 14.135 14.135 17.4872 10 17.4872C5.86496 17.4872 2.51285 14.135 2.51285 10Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
CircleIcon.displayName = 'CircleIcon'
