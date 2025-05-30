import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const TitleIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg width={'20'} height={'20'} viewBox={'0 0 24 24'} {...props}>
    <path
      d={
        'M10.5 7h-4q-.625 0-1.062-.437T5 5.5t.438-1.062T6.5 4h11q.625 0 1.063.438T19 5.5t-.437 1.063T17.5 7h-4v11.5q0 .625-.437 1.063T12 20t-1.062-.437T10.5 18.5z'
      }
      fill={'currentColor'}
    />
  </svg>
)
TitleIcon.displayName = 'TitleIcon'
