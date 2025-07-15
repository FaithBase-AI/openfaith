import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const PCOServicesIcon = ({
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
        id={'00f9217c-0536-41ea-b265-a8689874be71'}
        x1={2.04}
        x2={17.976}
        y1={2.029}
        y2={17.965}
      >
        <stop offset={0} stopColor={'#6eaa50'} />
        <stop offset={1} stopColor={'#6a9639'} />
      </linearGradient>
    </defs>
    <path
      d={
        'M19.968,10c0,7.968-1.992,9.96-9.96,9.96S.048,17.965.048,10,2.04.037,10.008.037,19.968,2.029,19.968,10Z'
      }
      fill={'url(#00f9217c-0536-41ea-b265-a8689874be71)'}
    />
    <path
      d={
        'M6.5,6.559A1.059,1.059,0,1,1,5.443,5.5,1.059,1.059,0,0,1,6.5,6.559ZM5.443,8.943A1.059,1.059,0,1,0,6.5,10,1.059,1.059,0,0,0,5.443,8.943Zm0,3.443A1.059,1.059,0,1,0,6.5,13.445,1.059,1.059,0,0,0,5.443,12.386ZM15,6.087a.485.485,0,0,0-.485-.485H8.136a.485.485,0,0,0-.485.485V7.03a.485.485,0,0,0,.485.485h6.38A.485.485,0,0,0,15,7.03ZM15,9.53a.485.485,0,0,0-.485-.485H8.136a.485.485,0,0,0-.485.485v.943a.485.485,0,0,0,.485.485h6.38A.485.485,0,0,0,15,10.473Zm0,3.443a.485.485,0,0,0-.485-.485H8.136a.485.485,0,0,0-.485.485v.943a.485.485,0,0,0,.485.485h6.38A.485.485,0,0,0,15,13.916Z'
      }
      fill={'#fff'}
    />
  </svg>
)
PCOServicesIcon.displayName = 'PCOServicesIcon'
