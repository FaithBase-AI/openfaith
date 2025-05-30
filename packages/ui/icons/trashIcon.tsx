import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const TrashIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg
    ref={ref}
    width={'24'}
    height={'24'}
    viewBox={'0 0 24 24'}
    fill={'none'}
    stroke={'currentColor'}
    strokeWidth={'2'}
    strokeLinecap={'round'}
    strokeLinejoin={'round'}
    className={'lucide-icon customizable'}
    {...props}
  >
    <path d={'M3 6h18'} />
    <path d={'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'} />
    <path d={'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'} />
  </svg>
)
TrashIcon.displayName = 'TrashIcon'
