import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const TrashIcon = ({
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
    <path d={'M3 6h18'} />
    <path d={'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'} />
    <path d={'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'} />
  </svg>
)
TrashIcon.displayName = 'TrashIcon'
