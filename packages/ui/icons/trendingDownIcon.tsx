import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const TrendingDownIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={
        'm16.85 17.15l1.44-1.44l-4.88-4.88l-3.29 3.29a.996.996 0 0 1-1.41 0l-6-6.01A.996.996 0 1 1 4.12 6.7L9.41 12l3.29-3.29a.996.996 0 0 1 1.41 0l5.59 5.58l1.44-1.44a.5.5 0 0 1 .85.35v4.29c0 .28-.22.5-.5.5H17.2c-.44.01-.66-.53-.35-.84'
      }
      fill={'currentColor'}
    />
  </svg>
)
TrendingDownIcon.displayName = 'TrendingDownIcon'
