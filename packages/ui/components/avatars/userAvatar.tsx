'use client'

import { BaseAvatar } from '@openfaith/ui/components/avatars/baseAvatar'
import { Avatar } from '@openfaith/ui/components/ui/avatar'
import BoringAvatar from 'boring-avatars'
import { Option, pipe } from 'effect'
import type { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentPropsWithoutRef, FC, Ref } from 'react'

type UserAvatarBaseProps = {
  size?: number
  ref?: Ref<HTMLElement>
} & ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>

type UserAvatarProps = UserAvatarBaseProps & {
  name: string | null
  userId: string
  avatar?: string | null
}

export const UserAvatar: FC<UserAvatarProps> = (props) => {
  const { userId, size = 40, avatar, name, ...domProps } = props

  return (
    <Avatar {...domProps} style={{ height: size, width: size }}>
      {pipe(
        avatar,
        Option.fromNullable,
        Option.match({
          onNone: () => (
            <BoringAvatar
              size={size}
              variant={'marble'}
              colors={['#0A0310', '#49007E', '#FF005B', '#FF7D10', '#FFB238']}
              name={userId}
            />
          ),
          onSome: (x) => (
            <BaseAvatar size={size} name={name} avatar={x} _tag='user' {...domProps} />
          ),
        }),
      )}
    </Avatar>
  )
}

// type UserIdAvatarProps = UserAvatarBaseProps & {
//   userId: string
// }

// export const UserIdAvatar: FC<UserIdAvatarProps> = (props) => {
//   const { userId, ...domProps } = props

//   const { userOpt, loading } = useUserOpt(userId)

//   return pipe(
//     userOpt,
//     Option.match({
//       onNone: () =>
//         pipe(
//           loading,
//           Boolean.match({
//             onFalse: nullOp,
//             onTrue: () => <BaseAvatarSkeleton size={domProps.size} _tag='user' />,
//           }),
//         ),
//       onSome: (x) => <UserAvatar userId={userId} name={x.name} avatar={x.image} {...domProps} />,
//     }),
//   )
// }
