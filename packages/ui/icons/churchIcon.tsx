import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChurchIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={
        'M7.57574 7.42426C7.81005 7.18995 8.18995 7.18995 8.42426 7.42426L11.8243 10.8243C11.9368 10.9368 12 11.0894 12 11.2485V21.4C12 21.7314 11.7314 22 11.4 22H4.6C4.26863 22 4 21.7314 4 21.4V11.2485C4 11.0894 4.06321 10.9368 4.17574 10.8243L7.57574 7.42426Z'
      }
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M8 7V4M8 2V4M8 4H6M8 4H10'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={
        'M12 22H19.4C19.7314 22 20 21.7314 20 21.4V10.7485C20 10.5894 19.9368 10.4368 19.8243 10.3243L16.6757 7.17574C16.5632 7.06321 16.4106 7 16.2515 7H8'
      }
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M8 22V17'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M8 13.01L8.01 12.9989'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
  </svg>
)
ChurchIcon.displayName = 'ChurchIcon'
