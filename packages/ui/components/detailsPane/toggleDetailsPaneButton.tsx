import { Button, type ButtonProps } from '@openfaith/ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@openfaith/ui/components/ui/tooltip'
import { SideBarIcon } from '@openfaith/ui/icons/sideBarIcon'
import { detailsPaneStickyAtom } from '@openfaith/ui/shared/globalState'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, pipe } from 'effect'
import { useAtom } from 'jotai'
import type { FC } from 'react'

export const ToggleDetailsPaneButton: FC<ButtonProps> = (props) => {
  const { className, ...domProps } = props

  const [detailsPaneSticky, setDetailsPaneSticky] = useAtom(detailsPaneStickyAtom)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn('group', className)}
          onClick={(event) => {
            event.preventDefault()
            setDetailsPaneSticky((x) => !x)
          }}
          size={'icon-sm'}
          variant={'ghost'}
          {...domProps}
        >
          <SideBarIcon isOpen={detailsPaneSticky} position='right' />
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        <p>
          {pipe(
            detailsPaneSticky,
            Boolean.match({
              onFalse: () => 'Pin details pane',
              onTrue: () => 'Overlay details pane',
            }),
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
