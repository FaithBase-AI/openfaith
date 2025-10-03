import type { Rectangle } from '@glideapps/glide-data-grid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@openfaith/ui/components/ui/dropdown-menu'
import { EditIcon } from '@openfaith/ui/icons/editIcon'
import { useUniversalTableEdit } from '@openfaith/ui/table/useUniversalTableEdit'
import { Option, pipe, type Schema } from 'effect'
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
  schema: Schema.Schema<T>
}

export const UniversalDropdownMenu = <T,>(props: UniversalDropdownMenuProps<T>) => {
  const { showMenu, setShowMenu, schema } = props

  const { onEditRow } = useUniversalTableEdit(schema)

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
        {pipe(
          showMenu,
          Option.fromNullable,
          Option.match({
            onNone: () => null,
            onSome: (x) => (
              <DropdownMenuItem
                onClick={() => {
                  onEditRow(x.row)
                }}
              >
                <EditIcon className={'mr-2 size-4'} />
                <p className={'mr-auto mb-auto ml-0'}>Edit</p>
              </DropdownMenuItem>
            ),
          }),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
