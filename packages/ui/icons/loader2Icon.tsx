import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const Loader2Icon = ({
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
    <path d={'M21 12a9 9 0 1 1-6.219-8.56'} />
  </svg>
)
Loader2Icon.displayName = 'Loader2Icon'
