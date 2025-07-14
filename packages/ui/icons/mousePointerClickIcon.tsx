import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const MousePointerClickIcon = ({
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
    <path d={'m9 9 5 12 1.8-5.2L21 14Z'} />
    <path d={'M7.2 2.2 8 5.1'} />
    <path d={'m5.1 8-2.9-.8'} />
    <path d={'M14 4.1 12 6'} />
    <path d={'m6 12-1.9 2'} />
  </svg>
)
MousePointerClickIcon.displayName = 'MousePointerClickIcon'
