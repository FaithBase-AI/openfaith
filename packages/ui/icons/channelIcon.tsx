import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChannelIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <g>
      <path d='M4 5.99982H3V20.9998H18V19.9998H4V5.99982Z' />
      <path d='M6 2.99982V17.9998H21V2.99982H6ZM11 13.9998V6.99982L17 10.4998L11 13.9998Z' />
    </g>
  </svg>
)
ChannelIcon.displayName = 'ChannelIcon'
