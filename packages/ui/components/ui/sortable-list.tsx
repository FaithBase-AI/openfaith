'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon } from '@openfaith/ui/icons/gripVerticalIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { createContext, type ReactNode, type SetStateAction, useContext, useState } from 'react'

// Context to share items and setItems across components
type SortableListContextType = {
  items: Array<string>
  setItems: (items: Array<string>) => void
}

const SortableListContext = createContext<SortableListContextType | undefined>(undefined)

function useSortableList() {
  const context = useContext(SortableListContext)
  if (!context) {
    throw new Error('useSortableList must be used within a SortableList')
  }
  return context
}

interface SortableListProps {
  children: ReactNode
  items: Array<string>
  onItemsChange?: (items: SetStateAction<Array<string>>) => void
  className?: string
}

function SortableList({ children, items, onItemsChange, className }: SortableListProps) {
  const [internalItems, setInternalItems] = useState<Array<string>>(items)

  // Use either internal state or parent-controlled state
  const actualItems = onItemsChange ? items : internalItems
  const setItems = (newItems: SetStateAction<Array<string>>) => {
    setInternalItems(newItems)
    onItemsChange?.(newItems)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id.toString())
        const newIndex = items.indexOf(over.id.toString())
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <SortableListContext.Provider value={{ items: actualItems, setItems }}>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext items={actualItems} strategy={verticalListSortingStrategy}>
          <div className={cn('space-y-3', className)}>{children}</div>
        </SortableContext>
      </DndContext>
    </SortableListContext.Provider>
  )
}

interface SortableItemProps {
  id: string
  children: ReactNode
  className?: string
}

function SortableItem({ id, children, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('touch-none', isDragging && 'z-10', className)}
    >
      {children}
    </div>
  )
}

interface SortableHandleProps {
  className?: string
}

function SortableHandle({ className }: SortableHandleProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <GripVerticalIcon className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
    </div>
  )
}

export { SortableHandle, SortableItem, SortableList, useSortableList }
