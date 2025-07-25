import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const LeaderIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={
        'M17 22q-.425 0-.713-.288T16 21v-1.25q-.975-.325-1.75-.988t-1.225-1.587q-.2-.375 0-.75t.6-.55q.35-.15.7.025t.55.525q.4.725 1.1 1.15T17.5 18h3q.625 0 1.063.438T22 19.5V21q0 .425-.288.713T21 22h-4Zm2-5q-.825 0-1.413-.588T17 15q0-.825.588-1.413T19 13q.825 0 1.413.588T21 15q0 .825-.588 1.413T19 17Zm-1.925-9.95q-2.35.3-4.013 1.975t-1.987 4.025q-.05.425-.35.688T10 14q-.425 0-.713-.288t-.237-.687q.35-3.2 2.613-5.425t5.462-2.55q.375-.05.625.238T18 6q0 .4-.263.7t-.662.35Zm.15 4.05q-.775.2-1.35.762T15.1 13.2q-.1.35-.412.575T14 14q-.425 0-.7-.263t-.225-.612q.275-1.575 1.413-2.675T17.2 9.075q.35-.05.575.238T18 10q0 .375-.213.688t-.562.412ZM3 11q-.425 0-.713-.288T2 10V8.5q0-.625.438-1.063T3.5 7h3q.825 0 1.525-.425t1.1-1.15q.2-.35.55-.563t.725-.087q.425.125.65.475t.075.725Q10.7 7 9.875 7.7T8 8.75V10q0 .425-.288.713T7 11H3Zm2-5q-.825 0-1.413-.588T3 4q0-.825.588-1.413T5 2q.825 0 1.413.588T7 4q0 .825-.588 1.413T5 6Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
LeaderIcon.displayName = 'LeaderIcon'
