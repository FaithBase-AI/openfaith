import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const PCOPeopleIcon = ({
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
        id={'7f805f16-2322-4b42-b61a-2bf71eadb25a'}
        x1={2.047}
        y1={2.036}
        x2={17.969}
        y2={17.958}
        gradientUnits={'userSpaceOnUse'}
      >
        <stop offset={0} stopColor={'#32a0f0'} />
        <stop offset={1} stopColor={'#3f75e5'} />
      </linearGradient>
    </defs>
    <path
      d={
        'M19.96,10c0,7.962-1.991,9.952-9.952,9.952S.056,17.959.056,10,2.047.045,10.008.045,19.96,2.036,19.96,10Z'
      }
      fill={'url(#7f805f16-2322-4b42-b61a-2bf71eadb25a)'}
    />
    <path
      fill={'#fff'}
      d={
        'M8.177,5.732A2.018,2.018,0,1,1,6.159,7.75,2.019,2.019,0,0,1,8.177,5.732Zm2.494,8.53H5.664A.565.565,0,0,1,5.1,13.7V12.422a1.841,1.841,0,0,1,1.841-1.841H9.394a1.841,1.841,0,0,1,1.841,1.841V13.7A.565.565,0,0,1,10.671,14.262ZM12.814,6.94A1.513,1.513,0,1,1,11.3,8.453,1.513,1.513,0,0,1,12.814,6.94Zm1.537,6.093H12.413a.565.565,0,0,1-.565-.565v-.049a2.292,2.292,0,0,0-.2-.957.555.555,0,0,0-.062-.141.8.8,0,0,0-.061-.11,1.19,1.19,0,0,0-.092-.16,1.131,1.131,0,0,1,.908-.472h1.472a1.108,1.108,0,0,1,1.105,1.1v.785A.565.565,0,0,1,14.351,13.033Z'
      }
    />
  </svg>
)
PCOPeopleIcon.displayName = 'PCOPeopleIcon'
