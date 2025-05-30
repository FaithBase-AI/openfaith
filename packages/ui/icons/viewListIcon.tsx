import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const ViewListIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg ref={ref} width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
    <path
      d='M1.66666 9.50016C1.66666 8.53491 1.86811 8.3335 2.83333 8.3335H17.1667C18.1319 8.3335 18.3333 8.53491 18.3333 9.50016V10.5002C18.3333 11.4654 18.1319 11.6668 17.1667 11.6668H2.83333C1.86811 11.6668 1.66666 11.4654 1.66666 10.5002V9.50016Z'
      stroke='black'
      strokeWidth='1.25'
      strokeLinecap='round'
    />
    <path
      d='M1.66666 2.83317C1.66666 1.86795 1.86811 1.6665 2.83333 1.6665H17.1667C18.1319 1.6665 18.3333 1.86795 18.3333 2.83317V3.83317C18.3333 4.7984 18.1319 4.99984 17.1667 4.99984H2.83333C1.86811 4.99984 1.66666 4.7984 1.66666 3.83317V2.83317Z'
      stroke='black'
      strokeWidth='1.25'
      strokeLinecap='round'
    />
    <path
      d='M1.66666 16.1667C1.66666 15.2014 1.86811 15 2.83333 15H17.1667C18.1319 15 18.3333 15.2014 18.3333 16.1667V17.1667C18.3333 18.1319 18.1319 18.3333 17.1667 18.3333H2.83333C1.86811 18.3333 1.66666 18.1319 1.66666 17.1667V16.1667Z'
      stroke='black'
      strokeWidth='1.25'
      strokeLinecap='round'
    />
  </svg>
)
ViewListIcon.displayName = 'ViewListIcon'
