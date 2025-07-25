import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const TextClearIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 24 24'} width={'20'} {...props}>
    <path
      d={'M11 20.001H5'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={
        'M12 4L8 20.0008M12 4C13.3874 4 15.1695 4.03054 16.5884 4.17648C17.1885 4.23819 17.4886 4.26905 17.7541 4.37789C18.3066 4.60428 18.7518 5.10062 18.9194 5.6768C19 5.95381 19 6.26991 19 6.90214M12 4C10.6126 4 8.83047 4.03054 7.41161 4.17648C6.8115 4.23819 6.51144 4.26905 6.24586 4.37789C5.69344 4.60428 5.24816 5.10062 5.08057 5.6768C5 5.95381 5 6.26991 5 6.90214'
      }
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeWidth={'1.5'}
    />
    <path
      d={'M14 15L19 20M14 20L19 15'}
      stroke={'currentColor'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={'1.5'}
    />
  </svg>
)
TextClearIcon.displayName = 'TextClearIcon'
