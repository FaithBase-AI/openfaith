import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const DensityMediumIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg width={'20'} height={'20'} viewBox={'0 0 24 24'} {...props}>
    <path
      d={
        'M4 21q-.425 0-.712-.288T3 20t.288-.712T4 19h16q.425 0 .713.288T21 20t-.288.713T20 21zm0-8q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm0-8q-.425 0-.712-.288T3 4t.288-.712T4 3h16q.425 0 .713.288T21 4t-.288.713T20 5z'
      }
      fill={'currentColor'}
    />
  </svg>
)
DensityMediumIcon.displayName = 'DensityMediumIcon'
