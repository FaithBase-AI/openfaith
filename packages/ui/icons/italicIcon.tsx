import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ItalicIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg ref={ref} width={'20'} height={'20'} viewBox={'0 0 24 24'} fill={'none'} {...props}>
    <path d={'M12 4H19'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
    <path d={'M8 20L16 4'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
    <path d={'M5 20H12'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} />
  </svg>
)
ItalicIcon.displayName = 'ItalicIcon'
