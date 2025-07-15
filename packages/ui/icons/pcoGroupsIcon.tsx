import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const PCOGroupsIcon = ({
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
        id={'86d10072-1c7f-4a02-88fe-0735565ae99a'}
        x1={1.939}
        x2={18.146}
        y1={1.928}
        y2={18.135}
      >
        <stop offset={0} stopColor={'#ff962d'} />
        <stop offset={1} stopColor={'#fc7638'} />
      </linearGradient>
    </defs>
    <path
      d={
        'M19.96,10c0,7.962-1.991,9.952-9.952,9.952S.056,17.959.056,10,2.047.045,10.008.045,19.96,2.036,19.96,10Z'
      }
      fill={'url(#86d10072-1c7f-4a02-88fe-0735565ae99a)'}
    />
    <path
      d={
        'M13.769,11.313V8.683a1.867,1.867,0,1,0-2.443-2.449H8.69A1.867,1.867,0,1,0,6.243,8.681v2.632A1.867,1.867,0,1,0,8.69,13.76h2.632a1.867,1.867,0,1,0,2.447-2.447Zm-1.455,0a1.873,1.873,0,0,0-.992.992H8.69a1.877,1.877,0,0,0-.992-.992V8.681a1.877,1.877,0,0,0,.992-.992h2.636a1.872,1.872,0,0,0,.988.99Z'
      }
      fill={'#fff'}
    />
  </svg>
)
PCOGroupsIcon.displayName = 'PCOGroupsIcon'
