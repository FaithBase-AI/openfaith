import { nullOp } from '@openfaith/shared'
import type { DetailsPaneParams } from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { IconWrapper } from '@openfaith/ui/components/icons/iconWrapper'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@openfaith/ui/components/ui/breadcrumb'
import { CalendarIcon } from '@openfaith/ui/icons/calendarIcon'
import { FileIcon } from '@openfaith/ui/icons/fileIcon'
import { GroupIcon } from '@openfaith/ui/icons/groupIcon'
import { PersonIcon } from '@openfaith/ui/icons/personIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Boolean, Match, pipe } from 'effect'
import type { FC, ReactNode } from 'react'

type DetailsPaneHistoryProps = {
  history: DetailsPaneParams
}

export const DetailsPaneHistory: FC<DetailsPaneHistoryProps> = (props) => {
  const { history } = props

  // TODO: Add proper URL generation hook
  const openDetailsPaneUrl = (_params: DetailsPaneParams) => '#'

  return pipe(
    history,
    Array.match({
      onEmpty: nullOp,
      onNonEmpty: (x) =>
        pipe(
          x.length > 1,
          Boolean.match({
            onFalse: nullOp,
            onTrue: () => (
              <Breadcrumb className={'px-4 pt-4'}>
                {pipe(
                  x,
                  Array.map((y, i) => (
                    <EntityBreadCrumb
                      entity={y}
                      href={openDetailsPaneUrl(pipe(x, Array.take(i + 1)))}
                      isCurrentPage={x.length - 1 === i}
                      key={`${y.entityType}-${y.entityId}`}
                    />
                  )),
                )}
              </Breadcrumb>
            ),
          }),
        ),
    }),
  )
}

type HistoryBreadCrumbProps = {
  href: string
  isCurrentPage: boolean
  Icon: ReactNode
  Title: ReactNode
}

const HistoryBreadCrumb: FC<HistoryBreadCrumbProps> = (props) => {
  const { href, Icon, Title, isCurrentPage, ...domProps } = props

  return (
    <BreadcrumbItem {...domProps}>
      <BreadcrumbLink
        className={cn(
          'flew-row inline-flex items-center',
          pipe(
            isCurrentPage,
            Boolean.match({
              onFalse: () => 'text-muted-foreground',
              onTrue: () => '',
            }),
          ),
        )}
        href={href}
      >
        <IconWrapper className={'mr-1'} size={3}>
          {Icon}
        </IconWrapper>

        {Title}
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}

type EntityBreadCrumbProps = Pick<HistoryBreadCrumbProps, 'href' | 'isCurrentPage'> & {
  entity: { entityType: string; entityId: string }
}

const EntityBreadCrumb: FC<EntityBreadCrumbProps> = (props) => {
  const { href, entity, isCurrentPage, ...domProps } = props

  // Get icon based on entity type
  const Icon = pipe(
    Match.value(entity.entityType),
    Match.when('person', () => <PersonIcon />),
    Match.when('group', () => <GroupIcon />),
    Match.when('campus', () => <CalendarIcon />),
    Match.when('folder', () => <FileIcon />),
    Match.orElse(() => <FileIcon />), // Default icon
  )

  // For now, use entity type + ID as title
  // TODO: Fetch actual entity data to get proper names
  const Title = `${entity.entityType} ${entity.entityId}`

  return (
    <HistoryBreadCrumb
      href={href}
      Icon={Icon}
      isCurrentPage={isCurrentPage}
      Title={Title}
      {...domProps}
    />
  )
}
