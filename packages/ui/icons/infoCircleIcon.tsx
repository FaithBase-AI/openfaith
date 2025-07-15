import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const InfoCircleIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      clipRule={'evenodd'}
      d={
        'M10 8.625C10.4142 8.625 10.75 8.96079 10.75 9.375V13.375C10.75 13.7892 10.4142 14.125 10 14.125C9.58579 14.125 9.25 13.7892 9.25 13.375V9.375C9.25 8.96079 9.58579 8.625 10 8.625Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
    <path
      d={
        'M10.75 6.75C10.75 7.16422 10.4142 7.5 10 7.5C9.58578 7.5 9.25 7.16422 9.25 6.75C9.25 6.33578 9.58578 6 10 6C10.4142 6 10.75 6.33578 10.75 6.75Z'
      }
      fill={'currentColor'}
    />
    <path
      clipRule={'evenodd'}
      d={
        'M10 2.38462C5.79414 2.38462 2.38462 5.79414 2.38462 10C2.38462 14.2059 5.79414 17.6154 10 17.6154C14.2059 17.6154 17.6154 14.2059 17.6154 10C17.6154 5.79414 14.2059 2.38462 10 2.38462ZM1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10Z'
      }
      fill={'currentColor'}
      fillRule={'evenodd'}
    />
  </svg>
)
InfoCircleIcon.displayName = 'InfoCircleIcon'
