import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const AlertCircleIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      clipRule='evenodd'
      d='M10 5.625C10.4142 5.625 10.75 5.96079 10.75 6.375V10.375C10.75 10.7892 10.4142 11.125 10 11.125C9.58579 11.125 9.25 10.7892 9.25 10.375V6.375C9.25 5.96079 9.58579 5.625 10 5.625Z'
      fill='currentColor'
      fillRule='evenodd'
    />
    <path
      d='M11 13.375C11 13.9273 10.5523 14.375 10 14.375C9.44771 14.375 9 13.9273 9 13.375C9 12.8227 9.44771 12.375 10 12.375C10.5523 12.375 11 12.8227 11 13.375Z'
      fill='currentColor'
    />
    <path
      clipRule='evenodd'
      d='M10 2.38462C5.79414 2.38462 2.38462 5.79414 2.38462 10C2.38462 14.2059 5.79414 17.6154 10 17.6154C14.2059 17.6154 17.6154 14.2059 17.6154 10C17.6154 5.79414 14.2059 2.38462 10 2.38462ZM1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10Z'
      fill='currentColor'
      fillRule='evenodd'
    />
  </svg>
)
AlertCircleIcon.displayName = 'AlertCircleIcon'
