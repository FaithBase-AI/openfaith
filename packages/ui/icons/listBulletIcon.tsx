import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ListBulletIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path d={'M8 5L20 5'} stroke={'currentColor'} strokeLinecap={'round'} strokeWidth={'1.5'} />
    <path
      d={'M4 5H4.00898'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'2'}
    />
    <path
      d={'M4 12H4.00898'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'2'}
    />
    <path
      d={'M4 19H4.00898'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'2'}
    />
    <path d={'M8 12L20 12'} stroke={'currentColor'} strokeLinecap={'round'} strokeWidth={'1.5'} />
    <path d={'M8 19L20 19'} stroke={'currentColor'} strokeLinecap={'round'} strokeWidth={'1.5'} />
  </svg>
)
ListBulletIcon.displayName = 'ListBulletIcon'
