import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const MoreVerticalIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      d={
        'M9 15C9 14.4477 9.44771 14 10 14C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M9 10.0001C9 9.44778 9.44772 9.00006 10 9.00006C10.5523 9.00006 11 9.44778 11 10.0001C11 10.5523 10.5523 11.0001 10 11.0001C9.44771 11.0001 9 10.5523 9 10.0001Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M9 5C9 4.44772 9.44772 4 10 4C10.5523 4 11 4.44772 11 5C11 5.55228 10.5523 6 10 6C9.44772 6 9 5.55228 9 5Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
MoreVerticalIcon.displayName = 'MoreVerticalIcon'
