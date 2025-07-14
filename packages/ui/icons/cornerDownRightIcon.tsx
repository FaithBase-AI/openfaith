import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const CornerDownRightIcon = ({
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
    <polyline points={'9 10 4 15 9 20'}></polyline>
    <path d={'M20 4v7a4 4 0 0 1-4 4H4'} />
  </svg>
)
CornerDownRightIcon.displayName = 'CornerDownLeftIcon'
