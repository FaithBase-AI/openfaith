import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const MoreHorizontalIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg width={'20'} height={'20'} viewBox={'0 0 20 20'} {...props}>
    <path
      d={
        'M15 11C14.4477 11 14 10.5523 14 10C14 9.44772 14.4477 9 15 9C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M10.0001 11C9.44778 11 9.00006 10.5523 9.00006 10C9.00006 9.44772 9.44778 9 10.0001 9C10.5523 9 11.0001 9.44772 11.0001 10C11.0001 10.5523 10.5523 11 10.0001 11Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M5 11C4.44772 11 4 10.5523 4 10C4 9.44772 4.44772 9 5 9C5.55228 9 6 9.44772 6 10C6 10.5523 5.55228 11 5 11Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
MoreHorizontalIcon.displayName = 'MoreHorizontalIcon'
