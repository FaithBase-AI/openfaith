import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const GripVerticalIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg width={'20'} height={'20'} viewBox={'0 0 20 20'} {...props}>
    <path
      d={
        'M7 15C7 14.4477 7.44771 14 8 14C8.55228 14 9 14.4477 9 15C9 15.5523 8.55228 16 8 16C7.44771 16 7 15.5523 7 15Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M7 10.0001C7 9.44778 7.44772 9.00006 8 9.00006C8.55228 9.00006 9 9.44778 9 10.0001C9 10.5523 8.55228 11.0001 8 11.0001C7.44771 11.0001 7 10.5523 7 10.0001Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M7 5C7 4.44771 7.44772 4 8 4C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M11 15C11 14.4477 11.4477 14 12 14C12.5523 14 13 14.4477 13 15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M11 10.0001C11 9.44778 11.4477 9.00006 12 9.00006C12.5523 9.00006 13 9.44778 13 10.0001C13 10.5523 12.5523 11.0001 12 11.0001C11.4477 11.0001 11 10.5523 11 10.0001Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M11 5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5C13 5.55228 12.5523 6 12 6C11.4477 6 11 5.55228 11 5Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
GripVerticalIcon.displayName = 'GripVerticalIcon'
