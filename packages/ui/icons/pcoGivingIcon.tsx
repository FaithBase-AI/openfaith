import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const PCOGivingIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
    fill={'none'}
    height={'20'}
    ref={ref}
    viewBox={'0 0 20 20'}
    width={'20'}
  >
    <defs>
      <linearGradient
        gradientUnits={'userSpaceOnUse'}
        id={'0aae6372-b733-476d-af45-8777c08c1e24'}
        x1={'2.047'}
        x2={'17.969'}
        y1={'2.036'}
        y2={'17.959'}
      >
        <stop offset={'0'} stopColor={'#f5c426'}></stop>
        <stop offset={'1'} stopColor={'#f2b327'}></stop>
      </linearGradient>
    </defs>
    <path
      d={
        'M10.008.045C2.047.045.056,2.036.056,10s1.991,9.952,9.952,9.952S19.96,17.959,19.96,10,17.969.045,10.008.045Z'
      }
      fill={'url(#0aae6372-b733-476d-af45-8777c08c1e24)'}
    />
    <path
      d={
        'M10.3,13.769a.508.508,0,0,1-.592,0c-1.259-.888-5.982-4.494-3.268-6.83a2.386,2.386,0,0,1,3.215.205l.349.349.349-.349a2.386,2.386,0,0,1,3.215-.205C16.286,9.275,11.563,12.881,10.3,13.769Z'
      }
      fill={'#fff'}
    />
  </svg>
)
PCOGivingIcon.displayName = 'PCOGivingIcon'
