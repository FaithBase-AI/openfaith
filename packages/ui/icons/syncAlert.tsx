import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const SyncAlertIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={
        'M11 13h2V7h-2m10-3h-6v6l2.24-2.24A6.003 6.003 0 0 1 19 12a5.99 5.99 0 0 1-4 5.65v2.09c3.45-.89 6-4.01 6-7.74c0-2.21-.91-4.2-2.36-5.64M11 17h2v-2h-2m-8-3c0 2.21.91 4.2 2.36 5.64L3 20h6v-6l-2.24 2.24A6.003 6.003 0 0 1 5 12a5.99 5.99 0 0 1 4-5.65V4.26C5.55 5.15 3 8.27 3 12Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
SyncAlertIcon.displayName = 'SyncAlertIcon'
