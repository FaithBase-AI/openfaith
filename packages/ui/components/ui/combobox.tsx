import { noOp, nullOp, removeReadonly } from '@openfaith/shared'
import {
  type ComboboxItemProps,
  DefaultComboboxItem,
} from '@openfaith/ui/components/ui/combobox-items'
import { DefaultComboBoxTrigger } from '@openfaith/ui/components/ui/combobox-triggers'
import type { BaseComboboxItem } from '@openfaith/ui/components/ui/combobox-types'
import { Popover, PopoverContent, PopoverTrigger } from '@openfaith/ui/components/ui/popover'
import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
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
  InputHTMLAttributes,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
} from 'react'
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const itemToString = <T extends BaseComboboxItem>(item: T | null): string =>
  pipe(
    item,
    Option.fromNullable,
    Option.flatMapNullable((x) => x.name),
    Option.getOrElse(() => ''),
  )

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
      // biome-ignore lint/a11y/noAutofocus: this is the way
      autoFocus
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
))
ComboboxInput.displayName = 'ComboboxInput'

export type ComboboxProps<T extends BaseComboboxItem> = {
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
  ComboboxItem?: (props: ComboboxItemProps<T>) => ReactNode
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
  showAllOptions?: boolean
  ref?: ForwardedRef<HTMLButtonElement>
}

export const Combobox = <T extends BaseComboboxItem>(props: ComboboxProps<T>) => {
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
    ComboboxItem = DefaultComboboxItem,
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
    showAllOptions = false,
    ref,
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
    <Popover onOpenChange={setOpen} open={open} {...props}>
      <PopoverTrigger asChild>
        <ComboboxTrigger<T>
          className={className}
          disabled={disabled}
          emptyText={emptyText}
          emptyTextClassName={emptyTextClassName}
          handleUnselect={handleUnselect}
          hideAvatar={hideAvatar}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          open={open}
          ref={ref}
          selectedOptions={selectedOptions}
          setOpen={setOpen}
        />
      </PopoverTrigger>

      <PopoverContent
        align={align}
        alignOffset={alignOffset}
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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxContent
          addItem={addItem}
          bottomItems={bottomItems}
          ComboboxItem={ComboboxItem}
          createItem={createItem}
          hideAvatar={hideAvatar}
          matchOptions={showAllOptions ? options : matchOptions}
          mode={mode}
          removeItem={removeItem}
          searchValue={searchValue}
          selectedOptions={selectedOptions}
          setOpen={setOpen}
          setSearchValue={handleSearchChange}
          side={side}
        />
      </PopoverContent>
    </Popover>
  )
}

type ComboboxContentProps<T extends BaseComboboxItem> = Pick<
  ComboboxProps<T>,
  'addItem' | 'removeItem' | 'selectedOptions' | 'bottomItems' | 'createItem'
> &
  Required<Pick<ComboboxProps<T>, 'mode' | 'ComboboxItem'>> & {
    searchValue: string
    setSearchValue: (value: string) => void
    setOpen: Dispatch<SetStateAction<boolean>>
    matchOptions: ReadonlyArray<T>
    side: ComponentPropsWithoutRef<typeof PopoverContent>['side']
    hideAvatar: boolean
  }

const ComboboxContent = <T extends BaseComboboxItem>(props: ComboboxContentProps<T>) => {
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
    ComboboxItem,
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
            _tag: 'create',
            id: '__create__',
            name: x.label,
          } as unknown as T,
        ],
      }),
    )
  }, [matchOptions, createItem])

  const rowVirtualizer = useVirtualizer({
    count: allItems.length,
    estimateSize: () => 32,
    getItemKey: (index) =>
      pipe(
        allItems,
        Array.get(index),
        Option.match({
          onNone: () => index,
          onSome: (x) => x.id,
        }),
      ),
    getScrollElement: () => containerRef.current,
    overscan: 5,
    paddingEnd: 6,
    paddingStart: 6,
    scrollPaddingEnd: 32,
    scrollPaddingStart: 32,
  })

  const { getItemProps, getMenuProps, getInputProps, highlightedIndex } = useCombobox<T>({
    defaultIsOpen: true,
    initialHighlightedIndex: 0,
    inputValue: searchValue,
    isOpen: true,
    items: allItems,
    itemToString,
    onInputValueChange: noOp,
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
  })

  return (
    <>
      <ComboboxInput
        placeholder={'Search ...'}
        // eslint-disable-next-line react-compiler/react-compiler
        {...getInputProps({
          onChange: (event) => setSearchValue(event.currentTarget.value),
          ref: inputRef,
          side,
          value: searchValue,
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

                  return (
                    <ComboboxItem
                      createItem={createItem}
                      getItemProps={getItemProps}
                      hideAvatar={hideAvatar}
                      highlighted={highlightedIndex === x.index}
                      item={y}
                      key={y.id}
                      rowVirtualizer={rowVirtualizer}
                      selected={selected}
                      virtualItem={x}
                    />
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
