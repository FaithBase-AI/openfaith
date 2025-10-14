/** biome-ignore-all lint/a11y/useSemanticElements: this is the way */
import { nullOp } from '@openfaith/shared'
import { UserAvatar } from '@openfaith/ui/components/avatars/userAvatar'
import { Badge } from '@openfaith/ui/components/ui/badge'
import { Button } from '@openfaith/ui/components/ui/button'
import { Card, CardContent } from '@openfaith/ui/components/ui/card'
import type { BaseComboboxItem } from '@openfaith/ui/components/ui/combobox-types'
import {
  SortableHandle,
  SortableItem,
  SortableList,
} from '@openfaith/ui/components/ui/sortable-list'
import { ArrowUpRightIcon } from '@openfaith/ui/icons/arrowUpRightIcon'
import { AtSignIcon } from '@openfaith/ui/icons/atSignIcon'
import { ChevronDownIcon } from '@openfaith/ui/icons/chevronDownIcon'
import { PlusIcon } from '@openfaith/ui/icons/plusIcon'
import { XIcon } from '@openfaith/ui/icons/xIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Boolean, Option, pipe } from 'effect'
import type { ButtonHTMLAttributes, Dispatch, ReactNode, SetStateAction } from 'react'
import { useState } from 'react'

export type ComboBoxTriggerProps<T extends BaseComboboxItem = BaseComboboxItem> =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    setOpen: Dispatch<SetStateAction<boolean>>
    open: boolean
    selectedOptions: ReadonlyArray<T>
    emptyText: string
    emptyTextClassName?: string
    handleUnselect: (t: T) => void
    disabled: boolean
    hideAvatar: boolean
    ref?: React.Ref<HTMLButtonElement>
  }

const displayArrayOfStrings = (placeholder: string) => (x: ReadonlyArray<string | null>) =>
  pipe(
    x,
    Array.map((y) =>
      pipe(
        y,
        Option.fromNullable,
        Option.getOrElse(() => 'No name'),
      ),
    ),
    Array.match({
      onEmpty: () => placeholder,
      onNonEmpty: (y) => {
        switch (y.length) {
          case 1:
            return pipe(y, Array.headNonEmpty)
          case 2:
            return pipe(y, Array.join(' and '))
          default:
            return pipe(
              y,
              Array.splitNonEmptyAt(2),
              // [a = Array.NonEmptyArray<{}>, b = Array<{}>]
              ([a, b]) =>
                `${pipe(a, Array.join(', '))}, and ${b.length} value${pipe(
                  b.length > 1,
                  Boolean.match({ onFalse: () => '', onTrue: () => 's' }),
                )}`,
            )
        }
      },
    }),
  )

export const DefaultComboBoxTrigger = <T extends BaseComboboxItem = BaseComboboxItem>(
  props: ComboBoxTriggerProps<T>,
): ReactNode => {
  const {
    setOpen,
    className,
    open,
    selectedOptions,
    emptyTextClassName,
    emptyText,
    handleUnselect,
    hideAvatar,
    ref,
    ...domProps
  } = props

  return (
    <button
      aria-expanded={open}
      className={cn(
        'flex cursor-pointer flex-wrap items-center gap-2 rounded-md border border-transparent p-0.5 hover:border-input data-[state=open]:border-input data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2',
        className,
      )}
      onClick={() => setOpen(!open)}
      ref={ref}
      role={'combobox'}
      {...domProps}
    >
      {pipe(
        selectedOptions,
        Array.match({
          onEmpty: () => (
            <p className={cn('my-auto text-sm transition-opacity', emptyTextClassName)}>
              {emptyText}
            </p>
          ),
          onNonEmpty: (x) =>
            pipe(
              x,
              Array.map((y) => (
                <Badge
                  key={y.id}
                  variant={pipe(
                    hideAvatar,
                    Boolean.match({
                      onFalse: () => 'avatar',
                      onTrue: () => 'secondary',
                    }),
                  )}
                >
                  {pipe(
                    hideAvatar,
                    Boolean.match({
                      onFalse: () => (
                        <UserAvatar
                          avatar={y.avatar}
                          name={pipe(
                            y.name,
                            Option.fromNullable,
                            Option.getOrElse(() => ''),
                          )}
                          size={24}
                          userId={y.id}
                        />
                      ),
                      onTrue: nullOp,
                    }),
                  )}

                  {y.name}

                  {pipe(
                    open,
                    Boolean.match({
                      onFalse: nullOp,
                      onTrue: () => (
                        <Button
                          asChild
                          className={'-mr-2 ml-0.5 size-6 rounded-full p-0'}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            handleUnselect(y)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUnselect(y)
                            }
                          }}
                          onPointerDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }}
                          size={'icon-xs'}
                          variant={'outline'}
                        >
                          {/* Doing this because button cannot be a descendant of a button */}
                          <div>
                            <XIcon className={'size-3'} />
                          </div>
                        </Button>
                      ),
                    }),
                  )}
                </Badge>
              )),
            ),
        }),
      )}
    </button>
  )
}

export const SelectComboBoxTrigger = <T extends BaseComboboxItem = BaseComboboxItem>(
  props: ComboBoxTriggerProps<T>,
): ReactNode => {
  const {
    setOpen,
    className,
    open,
    selectedOptions,
    emptyTextClassName,
    emptyText,
    handleUnselect,
    hideAvatar,
    ref,
    ...domProps
  } = props

  return (
    <button
      aria-expanded={open}
      className={cn(
        'flex min-h-10 w-full cursor-pointer items-center justify-between overflow-hidden rounded-md border border-input bg-background px-3 py-0.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      onClick={() => setOpen(!open)}
      ref={ref}
      role={'combobox'}
      {...domProps}
    >
      <div className={'flex flex-row flex-wrap gap-2 overflow-hidden'}>
        {pipe(
          selectedOptions,
          Array.match({
            onEmpty: () => (
              <p
                className={cn(
                  'my-auto select-none text-muted-foreground text-sm transition-opacity',
                  emptyTextClassName,
                )}
              >
                {emptyText}
              </p>
            ),
            onNonEmpty: (x) =>
              pipe(
                x,
                Array.map((y) => (
                  <Badge
                    className={'overflow-hidden'}
                    key={y.id}
                    variant={pipe(
                      y.id === 'all' || hideAvatar,
                      Boolean.match({
                        onFalse: () => 'avatar',
                        onTrue: () => 'secondary',
                      }),
                    )}
                  >
                    {pipe(
                      y.id === 'all' || hideAvatar,
                      Boolean.match({
                        onFalse: () => (
                          <UserAvatar
                            avatar={y.avatar}
                            name={pipe(
                              y.name,
                              Option.fromNullable,
                              Option.getOrElse(() => ''),
                            )}
                            size={24}
                            userId={y.id}
                          />
                        ),
                        onTrue: nullOp,
                      }),
                    )}

                    <span className={'truncate'}>{y.name}</span>

                    {pipe(
                      open,
                      Boolean.match({
                        onFalse: nullOp,
                        onTrue: () => (
                          <Button
                            asChild
                            className={'-mr-2 ml-0.5 size-6 shrink-0 rounded-full p-0'}
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              handleUnselect(y)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUnselect(y)
                              }
                            }}
                            onPointerDown={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                            }}
                            size={'icon-xs'}
                            variant={'outline'}
                          >
                            {/* Doing this because button cannot be a descendant of a button */}
                            <div>
                              <XIcon className={'size-3'} />
                            </div>
                          </Button>
                        ),
                      }),
                    )}
                  </Badge>
                )),
              ),
          }),
        )}
      </div>
      <ChevronDownIcon className={'size-4 shrink-0 opacity-50'} />
    </button>
  )
}

export const AssignedToComboBoxTrigger = <T extends BaseComboboxItem = BaseComboboxItem>(
  props: ComboBoxTriggerProps<T>,
): ReactNode => {
  const {
    setOpen,
    className,
    open,
    selectedOptions,
    emptyTextClassName,
    emptyText,
    handleUnselect: _handleUnselect,
    ref,
    ...domProps
  } = props

  return (
    <Button
      aria-expanded={open}
      className={cn(
        'shrink-0 overflow-hidden',
        className,
        pipe(
          selectedOptions,
          Array.isNonEmptyReadonlyArray,
          Boolean.match({
            onFalse: () => '',
            onTrue: () => emptyTextClassName,
          }),
        ),
      )}
      onClick={() => setOpen(!open)}
      ref={ref}
      role={'combobox'}
      size={'sm'}
      variant={'ghost'}
      {...domProps}
    >
      <AtSignIcon />

      <span
        className={cn(
          'truncate',
          pipe(
            selectedOptions,
            Array.match({
              onEmpty: () => 'opacity-50',
              onNonEmpty: () => '',
            }),
          ),
        )}
      >
        {pipe(
          selectedOptions,
          Array.map((x) => x.name),
          displayArrayOfStrings(emptyText),
        )}
      </span>
    </Button>
  )
}

export const LinkedRecordsComboBoxTrigger = <T extends BaseComboboxItem = BaseComboboxItem>(
  props: ComboBoxTriggerProps<T>,
): ReactNode => {
  const {
    setOpen,
    className,
    open,
    selectedOptions,
    emptyTextClassName,
    emptyText,
    handleUnselect: _handleUnselect,
    ref,
    ...domProps
  } = props

  return (
    <Button
      aria-expanded={open}
      className={cn(
        'shrink-0 overflow-hidden',
        className,
        pipe(
          selectedOptions,
          Array.isEmptyReadonlyArray,
          Boolean.match({
            onFalse: () => '',
            onTrue: () => emptyTextClassName,
          }),
        ),
      )}
      onClick={() => setOpen(!open)}
      ref={ref}
      role={'combobox'}
      size={'sm'}
      variant={'ghost'}
      {...domProps}
    >
      <ArrowUpRightIcon />

      <span className={'truncate'}>
        {pipe(
          selectedOptions,
          Array.match({
            onEmpty: () => emptyText,
            onNonEmpty: (x) => (
              <>
                {x.length} linked
                {pipe(
                  x.length > 1,
                  Boolean.match({
                    onFalse: () => ' record',
                    onTrue: () => ' records',
                  }),
                )}
              </>
            ),
          }),
        )}
      </span>
    </Button>
  )
}

export const SortableComboBoxTrigger = <T extends BaseComboboxItem = BaseComboboxItem>(
  props: ComboBoxTriggerProps<T>,
): ReactNode => {
  const { setOpen, className, open, selectedOptions, handleUnselect, ref, ...domProps } = props

  const [items, setItems] = useState(selectedOptions.map((option) => option.id))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <SortableList className='space-y-2' items={items} onItemsChange={setItems}>
        <Button
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          ref={ref}
          role={'combobox'}
          size={'sm'}
          variant={'ghost'}
          {...domProps}
        >
          <PlusIcon className={'size-4 shrink-0 opacity-50'} />
          Add Item
        </Button>

        {pipe(
          selectedOptions,
          Array.map((option) => (
            <SortableItem id={option.id} key={option.id}>
              <Card
                className={cn(
                  'cursor-grab border py-0 transition-colors hover:bg-accent/50 active:cursor-grabbing',
                )}
              >
                <CardContent className='flex items-center justify-between gap-3 p-4'>
                  <div className='flex items-center gap-3'>
                    <SortableHandle />
                    <span className='text-sm'>
                      {pipe(
                        option.name,
                        Option.fromNullable,
                        Option.getOrElse(() => ''),
                      )}
                    </span>
                  </div>
                  <Button
                    className='h-8 w-8'
                    onClick={() => handleUnselect(option)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    size='icon'
                    variant='ghost'
                  >
                    <XIcon className='h-4 w-4' />
                  </Button>
                </CardContent>
              </Card>
            </SortableItem>
          )),
        )}
      </SortableList>
    </div>
  )
}
