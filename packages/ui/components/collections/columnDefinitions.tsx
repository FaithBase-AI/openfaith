import { formatLabel, nullOp } from '@openfaith/shared'
import { UserAvatar } from '@openfaith/ui/components/avatars/userAvatar'
import { ColumnHeader } from '@openfaith/ui/components/collections/collectionComponents'
import type { FluentColumnConfigHelper } from '@openfaith/ui/components/data-table-filter/core/filters'
import { CalendarSearchIcon } from '@openfaith/ui/icons/calendarSearchIcon'
import { ClockIcon } from '@openfaith/ui/icons/clockIcon'
import { SearchIcon } from '@openfaith/ui/icons/searchIcon'
import type { ColumnDef, Row, RowData } from '@tanstack/table-core'
import { format } from 'date-fns/fp'
import { Array, Boolean, Match, Option, pipe, String } from 'effect'

export const matchEntityId = pipe(
  Match.type<string | { id: string }>(),
  Match.when(Match.string, (z) => z),
  Match.when({ id: Match.string }, (z) => z.id),
  Match.exhaustive,
)

export const collectionFilterFunction = <TData extends RowData>(
  { getValue, original }: Row<TData>,
  columnId: string,
  filterValue: unknown,
) =>
  pipe(
    (original as { id: string }).id,
    // We filter out fields here because of Herds. We don't want to remove empty
    // columns from the set when we filter. This seems to be the best option.
    String.startsWith('field'),
    Boolean.match({
      onFalse: () =>
        pipe(
          filterValue as Array<string>,
          Array.every((x) =>
            pipe(
              getValue<Array<string | { id: string }>>(columnId),
              Array.map((y) => pipe(y, matchEntityId)),
              Array.contains(x),
            ),
          ),
        ),
      onTrue: () => true,
    }),
  )

export const getIdColumn = <T extends { id: string }>(): ColumnDef<T> => ({
  accessorKey: 'id',
  enableHiding: false,
})

export const getTitleColumn = <T extends { title: string | null }>(): ColumnDef<T> => ({
  accessorKey: 'title',
  enableHiding: false,
  header: ({ column }) => <ColumnHeader column={column}>Title</ColumnHeader>,
  id: 'title',
  minSize: 144,
  size: 256,
})

export const getTitleFilter = <T extends { title: string | null }>(
  dtf: FluentColumnConfigHelper<T>,
) =>
  dtf
    .text()
    .id('title')
    .accessor((x) => x.title)
    .displayName('Title')
    .icon(SearchIcon)
    .hidden()
    .build()

export const getPositionColumn = <T extends { position: number | null }>(): ColumnDef<T> => ({
  accessorKey: 'position',
  enableHiding: false,
})

export const durationFilterFunction = <TData extends RowData>(
  { getValue }: Row<TData>,
  columnId: string,
  filterValue: unknown,
) => (getValue<number | null>(columnId) || 0) > (filterValue as number)

export const getDurationColumn = <T extends { duration: number | null }>(): ColumnDef<T> => ({
  accessorKey: 'duration',
  enableHiding: false,
  id: 'duration',
})

export const getDurationFilter = <T extends { duration: number | null }>(
  dtf: FluentColumnConfigHelper<T>,
) =>
  dtf
    .number()
    .id('duration')
    .accessor((x) => x.duration)
    .displayName('Duration')
    .icon(ClockIcon)
    .build()

export const getPublishedAtColumn = <T extends { publishedAt: number | null }>(): ColumnDef<T> => ({
  accessorKey: 'publishedAt',
  cell: ({ row }) =>
    pipe(
      row.original.publishedAt,
      Option.fromNullable,
      Option.match({
        onNone: nullOp,
        onSome: (x) => pipe(new Date(x), format('MMM d, yyyy h:mm a')),
      }),
    ),
  header: ({ column }) => <ColumnHeader column={column}>Published</ColumnHeader>,
  id: 'publishedAt',
  minSize: 172,
})

export const getPublishedAtFilter = <T extends { publishedAt: number | null }>(
  dtf: FluentColumnConfigHelper<T>,
) =>
  dtf
    .date()
    .id('publishedAt')
    .accessor((x) => x.publishedAt)
    .displayName('Published')
    .icon(CalendarSearchIcon)
    .build()

export const getCreatedAtColumn = <T extends { createdAt: number }>(): ColumnDef<T> => ({
  accessorKey: 'createdAt',
  cell: ({ getValue }) => {
    const value = getValue<number>()
    return pipe(new Date(value), format('MMM d, yyyy'))
  },
  enableHiding: false,
  header: ({ column }) => <ColumnHeader column={column}>Created At</ColumnHeader>,
  id: 'createdAt',
})

export const getCreatedAtFilter = <T extends { createdAt: number }>(
  dtf: FluentColumnConfigHelper<T>,
) =>
  dtf
    .date()
    .id('createdAt')
    .accessor((x) => x.createdAt)
    .displayName('Created At')
    .icon(CalendarSearchIcon)
    .build()
export const getTypeColumn = <T extends { type: string }>(): ColumnDef<T> => ({
  accessorKey: 'type',
  cell: ({ getValue }) => {
    const value = getValue<string>()
    return formatLabel(value)
  },
  enableHiding: false,
  header: ({ column }) => <ColumnHeader column={column}>Type</ColumnHeader>,
  id: 'type',
})

export const getUseColumn = <T extends { use: string }>(): ColumnDef<T> => ({
  accessorKey: 'use',
  cell: ({ getValue }) => {
    const value = getValue<string>()
    return formatLabel(value)
  },
  enableHiding: false,
  header: ({ column }) => <ColumnHeader column={column}>Use</ColumnHeader>,
  id: 'use',
})

export const getNameColumn = <T extends { name: string | null }>(): ColumnDef<T> => ({
  accessorKey: 'name',
  header: ({ column }) => <ColumnHeader column={column}>Name</ColumnHeader>,
  id: 'name',
  minSize: 144,
  size: 256,
})

export const getNameFilter = <T extends { name: string | null }>(
  dtf: FluentColumnConfigHelper<T>,
) =>
  dtf
    .text()
    .id('name')
    .accessor((x) => x.name)
    .displayName('Name')
    .icon(SearchIcon)
    .hidden()
    .build()

export const getEmailFilter = <T extends { email: string | null }>(
  dtf: FluentColumnConfigHelper<T>,
) =>
  dtf
    .text()
    .id('email')
    .accessor((x) => x.email)
    .displayName('Email')
    .icon(SearchIcon)
    .hidden()
    .build()

export const getDescriptionColumn = <T extends { description: string | null }>(): ColumnDef<T> => ({
  accessorKey: 'description',
  cell: ({ row }) => {
    const content = row.getValue('description') as string
    return <div className='whitespace-pre-wrap text-sm'>{content}</div>
  },
  enableHiding: false,
  header: ({ column }) => <ColumnHeader column={column}>Description</ColumnHeader>,
  id: 'description',
  minSize: 300,
})

export const getContentColumn = <T extends { content: string }>(): ColumnDef<T> => ({
  accessorKey: 'content',
  cell: ({ row }) => {
    const content = row.getValue('content') as string
    return <div className='whitespace-pre-wrap text-sm'>{content}</div>
  },
  enableHiding: false,
  header: ({ column }) => <ColumnHeader column={column}>Content</ColumnHeader>,
  id: 'content',
  minSize: 600,
})

export const getUserNameColumn = <
  T extends { id: string; name: string | null; image?: string | null },
>(): ColumnDef<T> => ({
  accessorKey: 'name',
  cell: ({ row }) => {
    const user = row.original
    return (
      <div className={'ml-0 flex items-center gap-3 pr-1 pl-0'}>
        <UserAvatar avatar={user.image} name={user.name} userId={user.id} />
        {user.name}
      </div>
    )
  },
  enableHiding: false,
  header: ({ column }) => <ColumnHeader column={column}>Name</ColumnHeader>,
  id: 'name',
  minSize: 144,
  size: 256,
})
