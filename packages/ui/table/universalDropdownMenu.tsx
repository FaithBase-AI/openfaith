import type { Rectangle } from '@glideapps/glide-data-grid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@openfaith/ui/components/ui/dropdown-menu'
import { Option, pipe } from 'effect'
import type { Dispatch, SetStateAction } from 'react'

type UniversalDropdownMenuProps<T> = {
  showMenu:
    | {
        row: T
        bounds: Rectangle
      }
    | undefined
  setShowMenu: Dispatch<
    SetStateAction<
      | {
          row: T
          bounds: Rectangle
        }
      | undefined
    >
  >
}

export const UniversalDropdownMenu = <T,>(props: UniversalDropdownMenuProps<T>) => {
  const { showMenu, setShowMenu } = props
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) {
          setShowMenu(undefined)
        }
      }}
      open={pipe(showMenu, Option.fromNullable, Option.isSome)}
    >
      <DropdownMenuTrigger asChild>
        <div
          style={pipe(
            showMenu,
            Option.fromNullable,
            Option.match({
              onNone: () => ({}),
              onSome: (x) => ({
                left: x.bounds.x,
                position: 'fixed',
                top: x.bounds.y + x.bounds.height,
              }),
            }),
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem
          onClick={() => {
            console.log('Test action clicked for row:', showMenu?.row)
            setShowMenu(undefined)
          }}
        >
          Test Action
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
