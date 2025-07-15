import type { IconProps } from '@openfaith/ui/icons/iconTypes'

export const BarsIcon = ({
  ref,
  ...props
}: IconProps & {
  ref?: React.RefObject<SVGSVGElement>
}) => (
  <svg height={'20'} viewBox={'0 0 20 20'} width={'20'} {...props}>
    <path
      d={
        'M0.762338 2C0.342449 2 0 2.33428 0 2.74916C0 3.16403 0.342448 3.49832 0.762338 3.49832L19.2377 3.49832C19.6576 3.49832 20 3.16404 20 2.74916C20 2.33429 19.6576 2 19.2377 2H0.762338Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M0.762338 9.25084C0.342449 9.25084 0 9.58512 0 10C0 10.4149 0.342448 10.7492 0.762338 10.7492L19.2377 10.7492C19.6576 10.7492 20 10.4149 20 10C20 9.58513 19.6576 9.25084 19.2377 9.25084L0.762338 9.25084Z'
      }
      fill={'currentColor'}
    />
    <path
      d={
        'M0.762338 16.5017C0.342449 16.5017 0 16.836 0 17.2508C0 17.6657 0.342448 18 0.762338 18L19.2377 18C19.6576 18 20 17.6657 20 17.2508C20 16.836 19.6576 16.5017 19.2377 16.5017L0.762338 16.5017Z'
      }
      fill={'currentColor'}
    />
  </svg>
)
BarsIcon.displayName = 'BarsIcon'
