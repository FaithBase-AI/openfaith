import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const GraduationCapIcon = ({
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
    <path d={'M22 10v6M2 10l10-5 10 5-10 5z'} />
    <path d={'M6 12v5c3 3 9 3 12 0v-5'} />
  </svg>
)
GraduationCapIcon.displayName = 'GraduationCapIcon'
