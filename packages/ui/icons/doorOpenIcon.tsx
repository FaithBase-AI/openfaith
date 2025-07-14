import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const DoorOpenIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg
    className={'lucide-icon customizable'}
    fill={'none'}
    height={'24'}
    ref={ref}
    stroke={'currentColor'}
    strokeLinecap={'round'}
    strokeLinejoin={'round'}
    strokeWidth={'2'}
    viewBox={'0 0 24 24'}
    width={'24'}
    {...props}
  >
    <path d={'M13 4h3a2 2 0 0 1 2 2v14'} />
    <path d={'M2 20h3'} />
    <path d={'M13 20h9'} />
    <path d={'M10 12v.01'} />
    <path
      d={
        'M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z'
      }
    />
  </svg>
)
DoorOpenIcon.displayName = 'DoorOpenIcon'
