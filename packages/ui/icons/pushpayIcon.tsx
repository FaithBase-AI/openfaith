import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const PushpayIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
    ref={ref}
    x={'0'}
    y={'0'}
    enableBackground={'new 0 0 61.8 61.8'}
    viewBox={'0 0 61.8 61.8'}
  >
    <circle cx={'30.6'} cy={'30.8'} r={'24'} fill={'#fff'}></circle>
    <path d={'M38.2 20.9h-3.7l-2.2 11h4.3c3.7 0 6.9-2.1 6.9-6.1.1-3.3-2.3-4.9-5.3-4.9z'} />
    <path
      d={
        'M30.9 0C13.8 0 0 13.8 0 30.9 0 48 13.8 61.8 30.9 61.8 48 61.8 61.8 48 61.8 30.9 61.8 13.8 47.9 0 30.9 0zM14.4 45.3L20 16.4h2.3l-5.6 28.9h-2.3zm5.2 0l5.6-28.9h2.3L22 45.3h-2.4zm17.5-9h-5.6l-1.7 9h-4.9l5.6-28.9H38c7.3 0 10.6 4.3 10.6 9.2 0 6.9-5.3 10.7-11.5 10.7z'
      }
    />
  </svg>
)
PushpayIcon.displayName = 'PushpayIcon'
