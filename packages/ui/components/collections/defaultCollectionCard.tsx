import { nullOp } from '@openfaith/shared'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@openfaith/ui/components/ui/card'
import { cn } from '@openfaith/ui/shared/utils'
import type { Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { Array, Option, pipe } from 'effect'
import { type ComponentRef, Fragment, type ReactElement, type RefObject } from 'react'

type DefaultCollectionCardProps<TData> = {
  row: Row<TData>
  ref?: RefObject<ComponentRef<typeof Card>>
}

export const DefaultCollectionCard = <TData,>(
  props: DefaultCollectionCardProps<TData>,
): ReactElement => {
  const { row, ref } = props

  const cells = row.getVisibleCells()

  return (
    <Card
      className={cn(
        'group relative flex flex-1 shrink-0 select-none flex-col gap-1 transition-transform',
      )}
      data-state={row.getIsSelected() && 'selected'}
      ref={ref}
    >
      {pipe(
        cells,
        Array.head,
        Option.match({
          onNone: nullOp,
          onSome: (x) => (
            <CardHeader className={'border-b'}>
              <CardTitle>{flexRender(x.column.columnDef.cell, x.getContext())}</CardTitle>

              {pipe(
                cells,
                Array.tail,
                Option.getOrElse((): typeof cells => []),
                Array.filter((x) => x.column.id === 'edit' || x.column.id === 'actions'),
                Array.match({
                  onEmpty: nullOp,
                  onNonEmpty: (y) => (
                    <CardAction>
                      {pipe(
                        y,
                        Array.map((z) => (
                          <Fragment key={z.id}>
                            {flexRender(z.column.columnDef.cell, z.getContext())}
                          </Fragment>
                        )),
                      )}
                    </CardAction>
                  ),
                }),
              )}
            </CardHeader>
          ),
        }),
      )}

      {pipe(
        cells,
        Array.tail,
        Option.getOrElse((): typeof cells => []),
        Array.filter((x) => x.column.id !== 'edit' && x.column.id !== 'actions'),
        Array.match({
          onEmpty: nullOp,
          onNonEmpty: (x) => (
            <CardContent className={'gap-2'}>
              {pipe(
                x,
                Array.match({
                  onEmpty: nullOp,
                  onNonEmpty: (y) =>
                    pipe(
                      y,
                      Array.map((z) => (
                        <div className={'flex flex-row items-start'} key={z.id}>
                          <div className={'flex-1 font-semibold text-sm'}>
                            {flexRender(
                              z.column.columnDef.header,
                              // @ts-ignore
                              z.getContext(),
                            )}
                          </div>
                          <div className={'flex-2'}>
                            {flexRender(z.column.columnDef.cell, z.getContext())}
                          </div>
                        </div>
                      )),
                    ),
                }),
              )}
            </CardContent>
          ),
        }),
      )}
    </Card>
  )
}
