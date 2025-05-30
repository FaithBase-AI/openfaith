import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const CheckIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg width={'20'} height={'20'} viewBox={'0 0 20 20'} {...props}>
    <path
      fillRule={'evenodd'}
      clipRule={'evenodd'}
      d={
        'M16.7268 4.16931C17.0465 4.42991 17.0923 4.8977 16.8289 5.21415L8.07894 15.7296C7.93177 15.9065 7.71033 16.0061 7.47893 15.9997C7.24752 15.9933 7.03208 15.8814 6.89519 15.6967L3.14519 10.6358C2.90023 10.3052 2.97244 9.84068 3.30647 9.59826C3.64049 9.35583 4.10984 9.42729 4.35479 9.75787L7.53431 14.0489L15.671 4.27042C15.9344 3.95398 16.407 3.90871 16.7268 4.16931Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
CheckIcon.displayName = 'CheckIcon'
