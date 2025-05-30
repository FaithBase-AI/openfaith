import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const PCOCheckInsIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg
    xmlns={'http://www.w3.org/2000/svg'}
    {...props}
    ref={ref}
    width={'20'}
    height={'20'}
    viewBox={'0 0 20 20'}
    fill={'none'}
  >
    <defs>
      <linearGradient
        id={'679bc2bf-38c8-45ab-9ee3-a2ff814fead7'}
        x1={'1.75'}
        y1={'1.739'}
        x2={'18.156'}
        y2={'18.145'}
        gradientUnits={'userSpaceOnUse'}
      >
        <stop offset={'0'} stopColor={'#a76ebe'}></stop>
        <stop offset={'1'} stopColor={'#875e96'}></stop>
      </linearGradient>
    </defs>
    <path
      d={
        'M10.008.045C2.047.045.056,2.036.056,10s1.991,9.952,9.952,9.952S19.96,17.959,19.96,10,17.969.045,10.008.045Z'
      }
      fill={'url(#679bc2bf-38c8-45ab-9ee3-a2ff814fead7)'}
    />
    <path
      fill={'#fff'}
      d={
        'M14.175,8.341,9.258,13.256a1.157,1.157,0,0,1-1.638,0L5.161,10.8A1.159,1.159,0,1,1,6.8,9.16L8.439,10.8l4.1-4.1a1.159,1.159,0,0,1,1.639,1.639Z'
      }
    />
  </svg>
)
PCOCheckInsIcon.displayName = 'PCOCheckInsIcon'
