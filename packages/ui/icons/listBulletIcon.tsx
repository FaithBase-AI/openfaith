import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ListBulletIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg ref={ref} width={'20'} height={'20'} viewBox={'0 0 24 24'} fill={'none'} {...props}>
    <path d={'M8 5L20 5'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
    <path
      d={'M4 5H4.00898'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path
      d={'M4 12H4.00898'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path
      d={'M4 19H4.00898'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    />
    <path d={'M8 12L20 12'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
    <path d={'M8 19L20 19'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
  </svg>
)
ListBulletIcon.displayName = 'ListBulletIcon'
