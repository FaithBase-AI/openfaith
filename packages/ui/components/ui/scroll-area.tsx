'use client'

import { useElementSize } from '@openfaith/ui/shared/hooks/useElementSize'
import { mergeRefs } from '@openfaith/ui/shared/mergeRefs'
import { cn } from '@openfaith/ui/shared/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Boolean, pipe } from 'effect'
import { easeOut, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import {
  type ComponentProps,
  type ComponentRef,
  type CSSProperties,
  type FC,
  type ReactNode,
  type Ref,
  type RefObject,
  useMemo,
  useRef,
  useState,
} from 'react'

const shadowVariants = cva('pointer-events-none absolute z-50 from-white', {
  variants: {
    darkColor: {
      black: 'dark:from-black',
      neutral: 'dark:from-neutral-900',
    },
    direction: {
      horizontal: 'top-0 bottom-0 w-8',
      vertical: 'right-0 left-0 h-8',
    },
    side: {
      bottom: 'bottom-0 bg-linear-to-t',
      left: 'left-0 bg-linear-to-r',
      right: 'right-0 bg-linear-to-l',
      top: 'top-0 bg-linear-to-b',
    },
  },
})

type ScrollShadowProps = {
  scrollAreaViewportRef: RefObject<ComponentRef<typeof ScrollAreaPrimitive.Viewport> | null>
  direction?: 'horizontal' | 'vertical'
  shadowDarkColor?: VariantProps<typeof shadowVariants>['darkColor']
  children?: ReactNode
}

const ScrollShadow: FC<ScrollShadowProps> = (props) => {
  const {
    scrollAreaViewportRef,
    direction = 'vertical',
    shadowDarkColor = 'black',
    children,
  } = props

  const isVertical = direction === 'vertical'

  const { scrollXProgress, scrollYProgress, scrollY, scrollX } = useScroll({
    container: scrollAreaViewportRef,
  })

  // Create a flag to track if content can be scrolled
  const [canScrollX, setCanScrollX] = useState(false)
  const [canScrollY, setCanScrollY] = useState(false)

  // Use motion value event to update the scrollable state
  useMotionValueEvent(scrollX, 'change', () => {
    const isScrollable = !(scrollXProgress.get() === 1 && scrollX.get() === 0)

    // const isScrollable = !(scrollXProgress.get() === 1 && scrollX.get() === 0)
    if (canScrollX !== isScrollable) {
      setCanScrollX(isScrollable)
    }
  })

  useMotionValueEvent(scrollY, 'change', () => {
    const isScrollable = !(scrollYProgress.get() === 1 && scrollY.get() === 0)

    if (canScrollY !== isScrollable) {
      setCanScrollY(isScrollable)
    }
  })

  const { height = 100, width = 100 } = useElementSize(scrollAreaViewportRef)

  const leftOpacity = useTransform(
    scrollXProgress,
    [0, 1 - (width - 32 * 3) / width],
    [
      0,
      pipe(
        canScrollX,
        Boolean.match({
          onFalse: () => 0,
          onTrue: () => 1,
        }),
      ),
    ],
    {
      ease: easeOut,
    },
  )

  const rightOpacity = useTransform(scrollXProgress, [(width - 32 * 3) / width, 1], [1, 0], {
    ease: easeOut,
  })

  const topOpacity = useTransform(
    scrollYProgress,
    [0, 1 - (height - 32 * 3) / height],
    [
      0,
      pipe(
        canScrollY,
        Boolean.match({
          onFalse: () => 0,
          onTrue: () => 1,
        }),
      ),
    ],
    {
      ease: easeOut,
    },
  )

  const bottomOpacity = useTransform(scrollYProgress, [(height - 32 * 3) / height, 1], [1, 0], {
    ease: easeOut,
  })

  return (
    <>
      <motion.div
        className={shadowVariants({
          darkColor: shadowDarkColor,
          direction,
          side: pipe(
            isVertical,
            Boolean.match({
              onFalse: () => 'left',
              onTrue: () => 'top',
            }),
          ),
        })}
        style={{
          opacity: pipe(
            isVertical,
            Boolean.match({
              onFalse: () => leftOpacity,
              onTrue: () => topOpacity,
            }),
          ),
        }}
      />

      {children}

      <motion.div
        className={shadowVariants({
          darkColor: shadowDarkColor,
          direction,
          side: pipe(
            isVertical,
            Boolean.match({
              onFalse: () => 'right',
              onTrue: () => 'bottom',
            }),
          ),
        })}
        style={{
          opacity: pipe(
            isVertical,
            Boolean.match({
              onFalse: () => rightOpacity,
              onTrue: () => bottomOpacity,
            }),
          ),
        }}
      />
    </>
  )
}

function ScrollArea({
  ref,
  className,
  children,
  viewportClassName,
  scrollAreaViewportRef: passedScrollAreaViewportRef,
  scrollAreaStyle,
  direction = 'vertical',
  shadowDarkColor = 'black',
  scrollShadow = false,
  ...props
}: ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportClassName?: string
  scrollAreaViewportRef?: Ref<ComponentRef<typeof ScrollAreaPrimitive.Viewport>>
  scrollAreaStyle?: CSSProperties
  scrollShadow?: boolean
  direction?: 'horizontal' | 'vertical'
  shadowDarkColor?: VariantProps<typeof shadowVariants>['darkColor']
}) {
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null)

  const localScrollAreaRef = useMemo(
    // eslint-disable-next-line react-compiler/react-compiler
    () => mergeRefs([scrollAreaViewportRef, passedScrollAreaViewportRef]),
    [passedScrollAreaViewportRef],
  )

  return (
    <ScrollAreaPrimitive.Root className={cn('overflow-hidden', className)} ref={ref} {...props}>
      <ScrollAreaPrimitive.Viewport
        className={cn(
          'size-full overscroll-none rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50',
          viewportClassName,
        )}
        ref={localScrollAreaRef}
        style={scrollAreaStyle}
      >
        {pipe(
          scrollShadow,
          Boolean.match({
            onFalse: () => children,
            onTrue: () => (
              <ScrollShadow
                direction={direction}
                scrollAreaViewportRef={scrollAreaViewportRef}
                shadowDarkColor={shadowDarkColor}
              >
                {children}
              </ScrollShadow>
            ),
          }),
        )}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        'flex touch-none select-none p-px transition-colors',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      data-slot='scroll-area-scrollbar'
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className='relative flex-1 rounded-full bg-border'
        data-slot='scroll-area-thumb'
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
