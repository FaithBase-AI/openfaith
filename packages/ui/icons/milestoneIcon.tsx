import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const MilestoneIcon = ({
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
    <path d={'M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z'} />
    <path d={'M12 13v8'} />
    <path d={'M12 3v3'} />
  </svg>
)
MilestoneIcon.displayName = 'MilestoneIcon'
