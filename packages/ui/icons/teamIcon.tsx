import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const TeamIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={
        'M9 21V8.775q-2.075-.55-3.388-2.2T4.05 2.825q-.05-.35.25-.588T5 2q.4 0 .7.213t.35.587q.275 1.8 1.55 3T10.75 7h2.5q.75 0 1.4.275t1.175.8L19.65 11.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275L15 10.05V21q0 .425-.288.713T14 22q-.425 0-.713-.288T13 21v-5h-2v5q0 .425-.288.713T10 22q-.425 0-.713-.288T9 21Zm3-15q-.825 0-1.413-.588T10 4q0-.825.588-1.413T12 2q.825 0 1.413.588T14 4q0 .825-.588 1.413T12 6Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
TeamIcon.displayName = 'TeamIcon'
