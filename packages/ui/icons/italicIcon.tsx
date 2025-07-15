import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ItalicIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path d={'M12 4H19'} stroke={'currentColor'} strokeLinecap={'round'} strokeWidth={'1.5'} />
    <path d={'M8 20L16 4'} stroke={'currentColor'} strokeLinecap={'round'} strokeWidth={'1.5'} />
    <path d={'M5 20H12'} stroke={'currentColor'} strokeLinecap={'round'} strokeWidth={'1.5'} />
  </svg>
)
ItalicIcon.displayName = 'ItalicIcon'
