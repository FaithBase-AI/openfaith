import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const CornerDownRightIcon = ({
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
    <polyline points={'9 10 4 15 9 20'}></polyline>
    <path d={'M20 4v7a4 4 0 0 1-4 4H4'} />
  </svg>
)
CornerDownRightIcon.displayName = 'CornerDownLeftIcon'
