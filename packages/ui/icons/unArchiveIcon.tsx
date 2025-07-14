import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const UnArchiveIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg fill='none' height={'20'} ref={ref} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      d='M5.83301 2.08337C4.66025 2.22117 3.85323 2.51244 3.24237 3.12807C2.08301 4.2965 2.08301 6.17706 2.08301 9.93821C2.08301 13.6993 2.08301 15.5799 3.24237 16.7483C4.40175 17.9167 6.26772 17.9167 9.99967 17.9167C13.7316 17.9167 15.5976 17.9167 16.757 16.7483C17.9163 15.5799 17.9163 13.6993 17.9163 9.93821C17.9163 6.17706 17.9163 4.2965 16.757 3.12807C16.1461 2.51244 15.3391 2.22117 14.1663 2.08337'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.25'
    />
    <path
      d='M12.084 4.16679C11.6744 3.74537 10.5842 2.08346 10.0007 2.08346M10.0007 2.08346C9.41715 2.08346 8.3269 3.74537 7.91732 4.16679M10.0007 2.08346V8.75012'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.25'
    />
    <path
      d='M18 12H13.852C13.1429 12 12.5858 12 12.2733 12C11.9337 12 11.2538 12 10 12C8.74619 12 8.0663 12 7.72677 12C7.41425 12 6.85707 12 6.14792 12H2'
      stroke='currentColor'
      strokeLinejoin='round'
      strokeWidth='1.25'
    />
  </svg>
)
UnArchiveIcon.displayName = 'UnArchiveIcon'
