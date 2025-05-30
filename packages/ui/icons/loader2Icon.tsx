import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const Loader2Icon = ({
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
    <path d={'M21 12a9 9 0 1 1-6.219-8.56'} />
  </svg>
)
Loader2Icon.displayName = 'Loader2Icon'
