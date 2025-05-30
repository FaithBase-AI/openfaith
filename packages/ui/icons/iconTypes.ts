import type { RefAttributes, SVGProps } from 'react'

type SVGAttributes = Partial<Omit<SVGProps<SVGSVGElement>, 'ref'>>
type ComponentAttributes = RefAttributes<SVGSVGElement> & SVGAttributes

export interface IconProps extends ComponentAttributes {
  size?: string | number
  absoluteStrokeWidth?: boolean
}
