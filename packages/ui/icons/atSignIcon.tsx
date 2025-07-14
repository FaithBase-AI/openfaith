import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const AtSignIcon = ({
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
    <circle cx={'12'} cy={'12'} r={'4'} />
    <path d={'M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8'} />
  </svg>
)
AtSignIcon.displayName = 'AtSignIcon'
