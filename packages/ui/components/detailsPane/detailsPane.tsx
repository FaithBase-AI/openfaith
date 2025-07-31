'use client'

import { nullOp } from '@openfaith/shared'
import { DetailsPaneHistory } from '@openfaith/ui/components/detailsPane/detailsPaneHistory'
import type { DetailsPaneParams } from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { ToggleDetailsPaneButton } from '@openfaith/ui/components/detailsPane/toggleDetailsPaneButton'
import { Button } from '@openfaith/ui/components/ui/button'
import { Dialog, DialogPortal } from '@openfaith/ui/components/ui/dialog'
import { Drawer, DrawerContent } from '@openfaith/ui/components/ui/drawer'
import { XIcon } from '@openfaith/ui/icons/xIcon'
import { detailsPaneStickyAtom } from '@openfaith/ui/shared/globalState'
import { useIsMdScreen } from '@openfaith/ui/shared/hooks/useMediaQuery'
import { cn } from '@openfaith/ui/shared/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Array, Boolean, Option, pipe, Record } from 'effect'
import { useAtom } from 'jotai'
import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'

const detailsPaneWidth = {
  campus: 'w-[28rem]',
  default: 'w-[28rem]',
  folder: 'w-[28rem]',
  group: 'w-[34rem]',
  none: 'w-[28rem]',
  person: 'w-[28rem]',
} as const

const getDetailsPaneWidth = (entityType: string): string => {
  return pipe(
    detailsPaneWidth,
    Record.get(entityType as keyof typeof detailsPaneWidth),
    Option.getOrElse(() => detailsPaneWidth.default),
  )
}

interface DetailsPaneProps {
  children?: ReactNode
  className?: string
  state?: DetailsPaneParams
  onClose?: () => void
}

export const DetailsPane: FC<DetailsPaneProps> = (props) => {
  const { children, className, state = [], onClose } = props

  const hasDetailsPane = useMemo(() => pipe(state, Array.isNonEmptyReadonlyArray), [state])

  const closeSideBar = onClose || nullOp

  return (
    <DetailsPaneWrapper
      className={className}
      closeSideBar={closeSideBar}
      detailsPaneParams={state}
      open={hasDetailsPane}
      width={pipe(
        state,
        Array.last,
        Option.match({
          onNone: () => detailsPaneWidth.default,
          onSome: (x) => getDetailsPaneWidth(x.entityType),
        }),
      )}
    >
      {children}
    </DetailsPaneWrapper>
  )
}

type DetailsPaneWrapperProps = {
  children: ReactNode
  open: boolean
  closeSideBar: () => void
  width: string
  detailsPaneParams: DetailsPaneParams
  className?: string
}

const DetailsPaneWrapper: FC<DetailsPaneWrapperProps> = (props) => {
  const { children, open, closeSideBar, width, detailsPaneParams, className } = props

  const isMdScreen = useIsMdScreen()

  const [detailsPaneSticky] = useAtom(detailsPaneStickyAtom)

  return pipe(
    isMdScreen,
    Boolean.match({
      onFalse: () => (
        <Drawer
          onClose={closeSideBar}
          onOpenChange={(x) => pipe(x, Boolean.match({ onFalse: closeSideBar, onTrue: nullOp }))}
          open={open}
        >
          <DrawerContent className={className}>
            <DetailsPaneHistory history={detailsPaneParams} />
            {children}
          </DrawerContent>
        </Drawer>
      ),
      onTrue: () =>
        pipe(
          detailsPaneSticky,
          Boolean.match({
            onFalse: () => (
              <Dialog
                onOpenChange={(x) =>
                  pipe(x, Boolean.match({ onFalse: closeSideBar, onTrue: nullOp }))
                }
                open={open}
              >
                <DialogPortal>
                  <DialogPrimitive.Overlay
                    className={
                      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs data-[state=closed]:animate-out data-[state=open]:animate-in'
                    }
                  />
                  <DialogPrimitive.Content
                    className={cn(
                      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-24 data-[state=open]:slide-in-from-right-24 fixed top-2 right-2 bottom-2 z-50 grid overflow-hidden rounded-2xl border bg-background shadow-lg duration-128 data-[state=closed]:animate-out data-[state=open]:animate-in',
                      width,
                      className,
                    )}
                  >
                    <VisuallyHidden asChild>
                      <DialogPrimitive.Title>Details Pane</DialogPrimitive.Title>
                    </VisuallyHidden>

                    <VisuallyHidden asChild>
                      <DialogPrimitive.Description>Details Pane</DialogPrimitive.Description>
                    </VisuallyHidden>

                    <DetailsPaneHistory history={detailsPaneParams} />
                    {children}

                    <div
                      className={'absolute top-3.5 right-4 z-50 flex flex-row items-center gap-1'}
                    >
                      <ToggleDetailsPaneButton />
                      <DialogPrimitive.Close asChild tabIndex={-1}>
                        <Button size={'icon-sm'} variant={'ghost'}>
                          <XIcon className={'size-4'} />
                          <span className={'sr-only'}>Close</span>
                        </Button>
                      </DialogPrimitive.Close>
                    </div>
                  </DialogPrimitive.Content>
                </DialogPortal>
              </Dialog>
            ),
            onTrue: () =>
              pipe(
                detailsPaneParams,
                Array.match({
                  onEmpty: nullOp,
                  onNonEmpty: () => (
                    <div
                      className={cn(
                        'my-2 flex flex-col overflow-hidden rounded-l-2xl border bg-background',
                        width,
                        className,
                      )}
                    >
                      <div
                        className={'absolute top-5 right-4 z-50 flex flex-row items-center gap-1'}
                      >
                        <ToggleDetailsPaneButton />
                        <Button onClick={() => closeSideBar()} size={'icon-sm'} variant={'ghost'}>
                          <XIcon className={'size-4'} />
                          <span className={'sr-only'}>Close</span>
                        </Button>
                      </div>
                      <DetailsPaneHistory history={detailsPaneParams} />
                      {children}
                    </div>
                  ),
                }),
              ),
          }),
        ),
    }),
  )
}
