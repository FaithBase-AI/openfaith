import { EntityAvatar } from '@openfaith/ui/components/avatars/entityAvatar'
import type {
  AddressComboboxItem,
  BaseComboboxItem,
} from '@openfaith/ui/components/ui/combobox-types'
import { CheckIcon } from '@openfaith/ui/icons/checkIcon'
import { PlusIcon } from '@openfaith/ui/icons/plusIcon'
import { cn } from '@openfaith/ui/shared/utils'
import type { VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import { Boolean, Option, pipe } from 'effect'
import type { HTMLAttributes, ReactNode } from 'react'
import { cloneElement } from 'react'

export type ComboboxItemProps<T extends BaseComboboxItem> = {
  item: T
  virtualItem: VirtualItem
  selected: boolean
  highlighted: boolean
  hideAvatar: boolean
  getItemProps: (options: {
    'aria-selected': boolean
    index: number
    item: T
  }) => Record<string, unknown>
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  createItem?: {
    icon?: ReactNode
    label: ReactNode
    onPress: () => void
  }
}

export type ComboboxItemWrapperProps<T extends BaseComboboxItem> = Pick<
  ComboboxItemProps<T>,
  'item' | 'virtualItem' | 'selected' | 'highlighted' | 'getItemProps' | 'rowVirtualizer'
> & {
  children: ReactNode
  showCheckbox?: boolean
}

export const ComboboxItemWrapper = <T extends BaseComboboxItem>(
  props: ComboboxItemWrapperProps<T>,
): ReactNode => {
  const {
    item,
    virtualItem,
    selected,
    highlighted,
    getItemProps,
    rowVirtualizer,
    children,
    showCheckbox = true,
  } = props

  return (
    <div
      key={item.id}
      style={{
        transform: `translateY(${virtualItem.start}px)`,
      }}
      {...getItemProps({
        'aria-selected': highlighted,
        index: virtualItem.index,
        item,
      })}
      className={
        'absolute flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50'
      }
      data-index={virtualItem.index}
      ref={rowVirtualizer.measureElement}
    >
      {showCheckbox && (
        <CheckIcon
          className={cn(
            'mr-2 size-4 shrink-0',
            pipe(
              selected,
              Boolean.match({
                onFalse: () => 'opacity-0',
                onTrue: () => 'opacity-100',
              }),
            ),
          )}
        />
      )}

      {children}
    </div>
  )
}

export const DefaultComboboxItem = <T extends BaseComboboxItem>(
  props: ComboboxItemProps<T>,
): ReactNode => {
  const {
    item,
    virtualItem,
    selected,
    highlighted,
    hideAvatar,
    getItemProps,
    rowVirtualizer,
    createItem,
  } = props

  const isCreateItem = item.id === '__create__'

  return (
    <ComboboxItemWrapper
      getItemProps={getItemProps}
      highlighted={highlighted}
      item={item}
      rowVirtualizer={rowVirtualizer}
      selected={selected}
      showCheckbox={!isCreateItem}
      virtualItem={virtualItem}
    >
      {pipe(
        !isCreateItem && item.id !== 'all' && !hideAvatar,
        Boolean.match({
          onFalse: () =>
            isCreateItem &&
            cloneElement(
              pipe(
                createItem?.icon,
                Option.fromNullable,
                Option.getOrElse(() => <PlusIcon />),
              ) as Parameters<typeof cloneElement>[0],
              {
                className: 'mr-2 size-4 shrink-0',
              } as HTMLAttributes<HTMLElement>,
            ),
          onTrue: () => <EntityAvatar className={'mr-2.5 self-center'} record={item} size={24} />,
        }),
      )}

      <span className={'line-clamp-2'}>{item.name}</span>
    </ComboboxItemWrapper>
  )
}

export const AddressComboboxItemComponent = <T extends AddressComboboxItem>(
  props: ComboboxItemProps<T>,
): ReactNode => {
  const {
    item,
    virtualItem,
    selected,
    highlighted,
    hideAvatar,
    getItemProps,
    rowVirtualizer,
    createItem,
  } = props

  const isCreateItem = item.id === '__create__'

  return (
    <ComboboxItemWrapper
      getItemProps={getItemProps}
      highlighted={highlighted}
      item={item}
      rowVirtualizer={rowVirtualizer}
      selected={selected}
      showCheckbox={!isCreateItem}
      virtualItem={virtualItem}
    >
      {pipe(
        !isCreateItem && item.id !== 'all' && !hideAvatar,
        Boolean.match({
          onFalse: () =>
            isCreateItem &&
            cloneElement(
              pipe(
                createItem?.icon,
                Option.fromNullable,
                Option.getOrElse(() => <PlusIcon />),
              ) as Parameters<typeof cloneElement>[0],
              {
                className: 'mr-2 size-4 shrink-0',
              } as HTMLAttributes<HTMLElement>,
            ),
          onTrue: () => (
            <EntityAvatar<T> className={'mr-2.5 self-center'} record={item} size={24} />
          ),
        }),
      )}

      <div className={'flex flex-col'}>
        <span className={'line-clamp-1 text-sm'}>
          {item.name}
          {item.name === item.line1 ? null : `, ${item.line1}`}
        </span>
        <span className={'line-clamp-1 text-muted-foreground text-xs'}>{item.line2}</span>
      </div>
    </ComboboxItemWrapper>
  )
}
