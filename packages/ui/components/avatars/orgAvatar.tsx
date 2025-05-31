'use client'

import { BaseAvatar } from '@openfaith/ui/components/avatars/baseAvatar'
import type { OrgClientShape } from '@openfaith/zero'
import type { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentPropsWithoutRef, FC, Ref } from 'react'

type OrgAvatarBaseProps = {
  size?: number
  ref?: Ref<HTMLElement>
} & ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>

type OrgAvatarProps = OrgAvatarBaseProps & {
  org: Pick<OrgClientShape, 'name' | 'logo'>
}

export const OrgAvatar: FC<OrgAvatarProps> = (props) => {
  const { org, ...domProps } = props

  return <BaseAvatar name={org.name} avatar={org.logo} _tag='org' {...domProps} />
}
