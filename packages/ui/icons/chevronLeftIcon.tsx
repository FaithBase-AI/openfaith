import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ChevronLeftIcon = ({
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
        'M13.2413 15.2646C12.9661 15.5742 12.4921 15.6021 12.1825 15.3269L6.82112 10.5613C6.66101 10.4189 6.5694 10.2149 6.5694 10.0007C6.5694 9.78648 6.66101 9.58248 6.82112 9.44015L12.1825 4.67451C12.4921 4.39933 12.9661 4.42721 13.2413 4.7368C13.5165 5.04639 13.4886 5.52044 13.179 5.79563L8.4483 10.0007L13.179 14.2058C13.4886 14.481 13.5165 14.955 13.2413 15.2646Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
ChevronLeftIcon.displayName = 'ChevronLeftIcon'
