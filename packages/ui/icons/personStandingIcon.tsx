import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const PersonStandingIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <g
      fill={'none'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'2'}
    >
      <circle cx={'12'} cy={'5'} r={'1'} />
      <path d={'m9 20l3-6l3 6M6 8l6 2l6-2m-6 2v4'} />
    </g>
  </svg>
)
PersonStandingIcon.displayName = 'PersonStandingIcon'
