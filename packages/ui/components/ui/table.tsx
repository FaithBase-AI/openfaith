import { ScrollArea } from '@openfaith/ui/components/ui/scroll-area'
import { cn } from '@openfaith/ui/shared/utils'
import type * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import type { ComponentRef, Ref } from 'react'

function Table({
  className,
  scrollAreaClassName,
  scrollAreaRef,
  scrollAreaViewportRef,
  ...props
}: React.ComponentProps<'table'> & {
  scrollAreaClassName?: string
  scrollAreaRef?: Ref<ComponentRef<typeof ScrollAreaPrimitive.Root>>
  scrollAreaViewportRef?: Ref<ComponentRef<typeof ScrollAreaPrimitive.Viewport>>
}) {
  return (
    <ScrollArea
      className={cn('w-full', scrollAreaClassName)}
      ref={scrollAreaRef}
      scrollAreaViewportRef={scrollAreaViewportRef}
      viewportClassName='overflow-auto!'
    >
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        data-slot='table'
        {...props}
      />
    </ScrollArea>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn('sticky top-0 z-10 bg-background [&_tr]:border-b', className)}
      data-slot='table-header'
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0', className)}
      data-slot='table-body'
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      data-slot='table-footer'
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      data-slot='table-row'
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      data-slot='table-head'
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn(
        'whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      data-slot='table-cell'
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      className={cn('mt-4 text-muted-foreground text-sm', className)}
      data-slot='table-caption'
      {...props}
    />
  )
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
