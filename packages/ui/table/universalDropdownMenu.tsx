import type { Rectangle } from '@glideapps/glide-data-grid'
import type { EntityUiConfig } from '@openfaith/schema'
import { nullOp } from '@openfaith/shared'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@openfaith/ui/components/ui/dropdown-menu'
import { EditIcon } from '@openfaith/ui/icons/editIcon'
import { TrashIcon } from '@openfaith/ui/icons/trashIcon'
import { useSchemaDelete } from '@openfaith/ui/shared/hooks/schemaMutations'
import { useUniversalTableEdit } from '@openfaith/ui/table/useUniversalTableEdit'
import { Option, pipe } from 'effect'
import type { Dispatch, SetStateAction } from 'react'

type UniversalDropdownMenuProps<T extends { id: string }> = {
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
  config: EntityUiConfig<T>
  orgId: string
  userId: string
}

export const UniversalDropdownMenu = <T extends { id: string }>(
  props: UniversalDropdownMenuProps<T>,
) => {
  const { showMenu, setShowMenu, config, orgId, userId } = props

  const { schema } = config

  const { onEditRow } = useUniversalTableEdit(schema)

  const [, deleteEntity] = useSchemaDelete({
    entityType: config.tag,
    orgId,
    schema,
    userId,
  })

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
            onNone: nullOp,
            onSome: (x) => (
              <>
                {config.meta.disableEdit ? null : (
                  <DropdownMenuItem
                    onClick={() => {
                      onEditRow(x.row)
                    }}
                  >
                    <EditIcon className={'mr-2 size-4'} />
                    <p className={'mr-auto mb-auto ml-0'}>Edit</p>
                  </DropdownMenuItem>
                )}
                {config.meta.disableDelete ? null : (
                  <DropdownMenuItem
                    onClick={() => {
                      deleteEntity([{ id: x.row.id }])
                    }}
                  >
                    <TrashIcon className={'mr-2 size-4 text-destructive'} />
                    <p className={'mr-auto mb-auto ml-0 text-destructive'}>Delete</p>
                  </DropdownMenuItem>
                )}
              </>
            ),
          }),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
