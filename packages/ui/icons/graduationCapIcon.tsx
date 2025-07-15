import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const GraduationCapIcon = ({
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
    <path d={'M22 10v6M2 10l10-5 10 5-10 5z'} />
    <path d={'M6 12v5c3 3 9 3 12 0v-5'} />
  </svg>
)
GraduationCapIcon.displayName = 'GraduationCapIcon'
