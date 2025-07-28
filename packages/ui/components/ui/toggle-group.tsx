'use client'

import { toggleVariants } from '@openfaith/ui/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@openfaith/ui/components/ui/tooltip'
import { cn } from '@openfaith/ui/shared/utils'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import type { VariantProps } from 'class-variance-authority'
import { Option, pipe } from 'effect'
import type { ComponentProps } from 'react'
import { createContext, useContext } from 'react'

const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
        className,
      )}
      data-size={size}
      data-slot='toggle-group'
      data-variant={variant}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  label,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants> & { label?: string }) {
  const context = useContext(ToggleGroupContext)

  const toggleGroupItem = (
    <ToggleGroupPrimitive.Item
      className={cn(
        toggleVariants({
          size: context.size || size,
          variant: context.variant || variant,
        }),
        'flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
        className,
      )}
      data-size={context.size || size}
      data-slot='toggle-group-item'
      data-variant={context.variant || variant}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )

  return pipe(
    label,
    Option.fromNullable,
    Option.match({
      onNone: () => toggleGroupItem,
      onSome: (x) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{toggleGroupItem}</span>
          </TooltipTrigger>
          <TooltipContent side={'bottom'}>{x}</TooltipContent>
        </Tooltip>
      ),
    }),
  )
}

export { ToggleGroup, ToggleGroupItem }
