import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const AccountHeartIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={
        'M15 14c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4m0-2a4 4 0 0 0 4-4a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4M5 15l-.6-.5C2.4 12.6 1 11.4 1 9.9c0-1.2 1-2.2 2.2-2.2c.7 0 1.4.3 1.8.8c.4-.5 1.1-.8 1.8-.8C8 7.7 9 8.6 9 9.9c0 1.5-1.4 2.7-3.4 4.6L5 15Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
AccountHeartIcon.displayName = 'AccountHeartIcon'
