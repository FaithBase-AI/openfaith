import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const StrikeThroughIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg ref={ref} width={'20'} height={'20'} viewBox={'0 0 24 24'} fill={'none'} {...props}>
    <path
      d={'M4 12H20'}
      stroke={'currentColor'}
      strokeWidth={'1.5'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path
      d={
        'M17.5 7.66667C17.5 5.08934 15.0376 3 12 3C8.96243 3 6.5 5.08934 6.5 7.66667C6.5 8.15279 6.55336 8.59783 6.6668 9M6 16.3333C6 18.9107 8.68629 21 12 21C15.3137 21 18 19.6667 18 16.3333C18 13.9404 16.9693 12.5782 14.9079 12'
      }
      stroke={'currentColor'}
      strokeWidth={'1.5'}
      strokeLinecap={'round'}
    />
  </svg>
)
StrikeThroughIcon.displayName = 'StrikeThroughIcon'
