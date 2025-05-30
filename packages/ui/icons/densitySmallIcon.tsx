import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const DensitySmallIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg width={'20'} height={'20'} viewBox={'0 0 24 24'} {...props}>
    <path
      d={
        'M4 22q-.425 0-.712-.288T3 21t.288-.712T4 20h16q.425 0 .713.288T21 21t-.288.713T20 22zm0-6q-.425 0-.712-.288T3 15t.288-.712T4 14h16q.425 0 .713.288T21 15t-.288.713T20 16zm0-6q-.425 0-.712-.288T3 9t.288-.712T4 8h16q.425 0 .713.288T21 9t-.288.713T20 10zm0-6q-.425 0-.712-.288T3 3t.288-.712T4 2h16q.425 0 .713.288T21 3t-.288.713T20 4z'
      }
      fill={'currentColor'}
    />
  </svg>
)
DensitySmallIcon.displayName = 'DensitySmallIcon'
