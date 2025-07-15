import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const EnterIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'12'} viewBox={'0 0 12 12'} width={'12'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M2 7.16667C2 7.29928 2.05268 7.42645 2.14645 7.52022L4.47978 9.85355C4.67504 10.0488 4.99162 10.0488 5.18689 9.85355C5.38215 9.65829 5.38215 9.34171 5.18689 9.14645L3.70711 7.66667L8.5 7.66667C9.32843 7.66667 10 6.99509 10 6.16667L10 2.5C10 2.22386 9.77614 2 9.5 2C9.22386 2 9 2.22386 9 2.5L9 6.16667C9 6.44281 8.77614 6.66667 8.5 6.66667L3.70711 6.66667L5.18689 5.18689C5.38215 4.99163 5.38215 4.67504 5.18689 4.47978C4.99162 4.28452 4.67504 4.28452 4.47978 4.47978L2.14645 6.81312C2.05268 6.90688 2 7.03406 2 7.16667Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
  </svg>
)
EnterIcon.displayName = 'EnterIcon'
