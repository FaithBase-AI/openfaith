import { idToRecordsTag, type RecordData } from '@openfaith/schema'
import { noOp, nullOp, removeReadonly } from '@openfaith/shared'
import { EntityAvatar } from '@openfaith/ui/components/avatars/entityAvatar'
import { DefaultComboBoxTrigger } from '@openfaith/ui/components/ui/combobox-triggers'
import type { BaseComboboxItem } from '@openfaith/ui/components/ui/combobox-types'
import { Popover, PopoverContent, PopoverTrigger } from '@openfaith/ui/components/ui/popover'
import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
import { CheckIcon } from '@openfaith/ui/icons/checkIcon'
import { PlusIcon } from '@openfaith/ui/icons/plusIcon'
import { SearchIcon } from '@openfaith/ui/icons/searchIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCombobox } from 'downshift'
import { Array, Boolean, Option, pipe } from 'effect'
import { matchSorter } from 'match-sorter'
import type {
  ComponentPropsWithoutRef,
  Dispatch,
  ForwardedRef,
  HTMLAttributes,
  InputHTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  SetStateAction,
} from 'react'
import { cloneElement, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const itemToString = <T extends BaseComboboxItem = BaseComboboxItem>(item: T | null): string =>
  pipe(
    item,
    Option.fromNullable,
    Option.flatMapNullable((x) => x.name),
    Option.getOrElse(() => ''),
  )

const transformComboboxItem = <T extends BaseComboboxItem = BaseComboboxItem>(
  item: T,
): RecordData => {
  const tag = idToRecordsTag(item.id)

  switch (tag) {
    case 'org':
      return {
        _tag: 'org',
        id: item.id,
        name: pipe(
          item.name,
          Option.fromNullable,
          Option.getOrElse(() => ''),
        ),
        logo: pipe(item.avatar, Option.fromNullable, Option.getOrNull),
      }
    case 'user':
      return {
        _tag: 'user',
        id: item.id,
        name: pipe(
          item.name,
          Option.fromNullable,
          Option.getOrElse(() => ''),
        ),
        image: pipe(item.avatar, Option.fromNullable, Option.getOrNull),
      }
  }
}

const ComboboxInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    side: ComponentPropsWithoutRef<typeof PopoverContent>['side']
  }
  // Firefox has an issue where onBlur is called when the input renders and is
  // focused (doesn't happen on chromium browsers). This cause it to auto select
  // the first item. It seems like we can just remove onBlur handler and it
  // works fine.
>(({ className, side, onBlur: _onBlur, ...props }, ref) => (
  <div
    className={cn(
      'flex items-center px-3',
      pipe(
        side === 'top',
        Boolean.match({
          onFalse: () => 'border-b',
          onTrue: () => 'border-t',
        }),
      ),
    )}
  >
    <SearchIcon className={'mr-2 size-4 shrink-0 opacity-50'} />

    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      // biome-ignore lint/a11y/noAutofocus: this is the way
      autoFocus
      {...props}
    />
  </div>
))
ComboboxInput.displayName = 'ComboboxInput'

export type ComboboxProps<T extends BaseComboboxItem = BaseComboboxItem> = {
  options: ReadonlyArray<T>
  selectedOptions: ReadonlyArray<T>
  onMouseEnter?: MouseEventHandler<HTMLElement> | undefined
  onMouseLeave?: MouseEventHandler<HTMLElement> | undefined
  className?: string
  addItem: (id: string) => void
  removeItem: (id: string) => void
  emptyText: string
  emptyTextClassName?: string
  ComboboxTrigger?: typeof DefaultComboBoxTrigger
  onClose?: () => void
  mode?: 'single' | 'multiple'
  alignOffset?: number
  sideOffset?: number
  popOverContentClassName?: string
  onBlur?: () => void
  disabled?: boolean
  side?: ComponentPropsWithoutRef<typeof PopoverContent>['side']
  align?: ComponentPropsWithoutRef<typeof PopoverContent>['align']
  hideAvatar?: boolean
  bottomItems?: ReactNode
  createItem?: {
    icon?: ReactNode
    label: ReactNode
    onPress: () => void
  }
  onSearchChange?: (params: {
    searchValue: string
    setOpen: Dispatch<SetStateAction<boolean>>
  }) => void
}

const Combobox = <T extends BaseComboboxItem = BaseComboboxItem>(
  props: ComboboxProps<T>,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const {
    options,
    selectedOptions,
    onMouseEnter,
    onMouseLeave,
    onBlur,
    className,
    addItem,
    removeItem,
    emptyText,
    emptyTextClassName,
    ComboboxTrigger = DefaultComboBoxTrigger,
    onClose = noOp,
    mode = 'multiple',
    alignOffset = -4,
    sideOffset = 6,
    popOverContentClassName,
    disabled = false,
    side = 'bottom',
    align = 'start',
    hideAvatar = false,
    bottomItems,
    createItem,
    onSearchChange,
  } = props

  const [searchValue, setSearchValue] = useState('')
  const [open, setOpen] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: no update
  useEffect(() => {
    pipe(
      open,
      Boolean.match({
        onFalse: () => {
          onClose()
          pipe(onBlur, Option.fromNullable, Option.match({ onNone: noOp, onSome: (x) => x() }))
        },
        onTrue: noOp,
      }),
    )
  }, [open])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      pipe(
        onSearchChange,
        Option.fromNullable,
        Option.match({
          onNone: noOp,
          onSome: (x) => x({ searchValue: value, setOpen }),
        }),
      )
    },
    [onSearchChange],
  )

  const matchOptions = useMemo(
    () =>
      matchSorter<T>(options, searchValue, {
        keys: ['name'],
      }),
    [options, searchValue],
  )

  const handleUnselect = useCallback(
    (x: T) => {
      removeItem(x.id)
    },
    [removeItem],
  )

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <ComboboxTrigger<T>
          setOpen={setOpen}
          open={open}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          selectedOptions={selectedOptions}
          className={className}
          emptyText={emptyText}
          emptyTextClassName={emptyTextClassName}
          handleUnselect={handleUnselect}
          ref={ref}
          disabled={disabled}
          hideAvatar={hideAvatar}
        />
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          'p-[3px]',
          pipe(
            side === 'top',
            Boolean.match({
              onFalse: () => '',
              onTrue: () => 'flex flex-col-reverse',
            }),
          ),
          popOverContentClassName,
        )}
        side={side}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <ComboboxContent
          searchValue={searchValue}
          setSearchValue={handleSearchChange}
          matchOptions={matchOptions}
          addItem={addItem}
          removeItem={removeItem}
          setOpen={setOpen}
          selectedOptions={selectedOptions}
          mode={mode}
          side={side}
          hideAvatar={hideAvatar}
          bottomItems={bottomItems}
          createItem={createItem}
        />
      </PopoverContent>
    </Popover>
  )
}

type ComboboxContentProps<T extends BaseComboboxItem = BaseComboboxItem> = Pick<
  ComboboxProps<T>,
  'addItem' | 'removeItem' | 'selectedOptions' | 'bottomItems' | 'createItem'
> &
  NonNullable<Pick<ComboboxProps<T>, 'mode'>> & {
    searchValue: string
    setSearchValue: (value: string) => void
    setOpen: Dispatch<SetStateAction<boolean>>
    matchOptions: ReadonlyArray<T>
    side: ComponentPropsWithoutRef<typeof PopoverContent>['side']
    hideAvatar: boolean
  }

const ComboboxContent = <T extends BaseComboboxItem = BaseComboboxItem>(
  props: ComboboxContentProps<T>,
) => {
  'use no memo'

  const {
    searchValue,
    setSearchValue,
    matchOptions,
    addItem,
    setOpen,
    removeItem,
    selectedOptions,
    mode,
    side,
    hideAvatar,
    bottomItems,
    createItem,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems = useMemo(() => {
    const items = pipe(matchOptions, removeReadonly)
    return pipe(
      createItem,
      Option.fromNullable,
      Option.match({
        onNone: () => items,
        onSome: (x) => [
          ...items,
          {
            id: '__create__',
            name: x.label,
            _tag: 'create',
          } as unknown as T,
        ],
      }),
    )
  }, [matchOptions, createItem])

  const rowVirtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => containerRef.current,
    getItemKey: (index) =>
      pipe(
        allItems,
        Array.get(index),
        Option.match({
          onNone: () => index,
          onSome: (x) => x.id,
        }),
      ),
    estimateSize: () => 32,
    overscan: 5,
    scrollPaddingStart: 32,
    scrollPaddingEnd: 32,
    paddingStart: 6,
    paddingEnd: 6,
  })

  const { getItemProps, getMenuProps, getInputProps, highlightedIndex } = useCombobox<T>({
    initialHighlightedIndex: 0,
    onSelectedItemChange: (x) => {
      pipe(
        x.selectedItem,
        Option.fromNullable,
        Option.match({
          onNone: noOp,
          onSome: (y) => {
            if (y.id === '__create__' && createItem) {
              createItem.onPress()
              return
            }

            pipe(
              selectedOptions,
              Array.findFirst((z) => z.id === y.id),
              Option.match({
                onNone: () => addItem(y.id),
                onSome: () => removeItem(y.id),
              }),
            )
          },
        }),
      )
    },
    onInputValueChange: noOp,
    items: allItems,
    itemToString,
    isOpen: true,
    defaultIsOpen: true,
    inputValue: searchValue,
    stateReducer(state, actionAndChanges) {
      const { changes, type } = actionAndChanges

      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          return {
            ...changes,
            highlightedIndex: 0,
          }

        case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
          rowVirtualizer.scrollToIndex(Math.max(0, state.highlightedIndex - 1))

          return {
            ...changes,
            highlightedIndex: Math.max(0, state.highlightedIndex - 1),
          }

        case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
          rowVirtualizer.scrollToIndex(Math.min(allItems.length - 1, state.highlightedIndex + 1))

          return {
            ...changes,
            highlightedIndex: Math.min(allItems.length - 1, state.highlightedIndex + 1),
          }

        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            highlightedIndex: state.highlightedIndex,
          }
        default:
          return changes
      }
    },
    onStateChange({ inputValue: newInputValue, type }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEscape:
          setOpen(false)
          break
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (mode === 'single') {
            setOpen(false)
          }
          break
        case useCombobox.stateChangeTypes.InputChange:
          setSearchValue(
            pipe(
              newInputValue,
              Option.fromNullable,
              Option.getOrElse(() => ''),
            ),
          )
          break
        default:
          break
      }
    },
  })

  return (
    <>
      <ComboboxInput
        placeholder={'Search ...'}
        // eslint-disable-next-line react-compiler/react-compiler
        {...getInputProps({
          ref: inputRef,
          value: searchValue,
          onChange: (event) => setSearchValue(event.currentTarget.value),
          side,
        })}
      />
      <ScrollArea
        viewportClassName={'max-h-[35vh]'}
        // eslint-disable-next-line react-compiler/react-compiler
        {...getMenuProps({ scrollAreaViewportRef: containerRef })}
      >
        <div className={'relative w-full'} style={{ height: rowVirtualizer.getTotalSize() }}>
          {pipe(
            rowVirtualizer.getVirtualItems(),
            Array.filterMap((x) =>
              pipe(
                allItems,
                Array.get(x.index),
                Option.map((y) => {
                  const selected = pipe(
                    selectedOptions,
                    Array.findFirst((z) => z.id === y.id),
                    Option.isSome,
                  )

                  const isCreateItem = y.id === '__create__'

                  return (
                    <div
                      key={y.id}
                      style={{
                        transform: `translateY(${x.start}px)`,
                      }}
                      {...getItemProps({
                        index: x.index,
                        item: y,
                        'aria-selected': highlightedIndex === x.index,
                      })}
                      data-index={x.index}
                      ref={rowVirtualizer.measureElement}
                      className={
                        'absolute flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50'
                      }
                    >
                      {!isCreateItem && (
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

                      {pipe(
                        !isCreateItem && y.id !== 'all' && !hideAvatar,
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
                            <EntityAvatar
                              record={transformComboboxItem(y)}
                              className={'mr-2.5 self-center'}
                              size={24}
                            />
                          ),
                        }),
                      )}

                      <span className={'line-clamp-2'}>{y.name}</span>
                    </div>
                  )
                }),
              ),
            ),
          )}
        </div>

        {pipe(
          bottomItems,
          Option.fromNullable,
          Option.match({
            onNone: nullOp,
            onSome: (items) => <div className='border-t'>{items}</div>,
          }),
        )}
      </ScrollArea>
    </>
  )
}

const ForwardRefCombobox = forwardRef(Combobox) as unknown as <
  T extends BaseComboboxItem = BaseComboboxItem,
>(
  props: ComboboxProps<T> & { ref?: ForwardedRef<HTMLButtonElement> },
) => ReactElement

export { ForwardRefCombobox as Combobox }
