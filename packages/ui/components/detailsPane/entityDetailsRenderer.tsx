import { DetailsPaneTabs } from '@openfaith/ui/components/detailsPane/detailsPaneTabs'
import type { DetailsPaneEntity } from '@openfaith/ui/components/detailsPane/detailsPaneTypes'

import { DetailsShell } from '@openfaith/ui/components/detailsPane/detailsShell'
import { Button } from '@openfaith/ui/components/ui/button'
import { EditIcon } from '@openfaith/ui/icons/editIcon'
import { FileIcon } from '@openfaith/ui/icons/fileIcon'
import { GroupIcon } from '@openfaith/ui/icons/groupIcon'
import { PersonIcon } from '@openfaith/ui/icons/personIcon'
import { Match, pipe } from 'effect'
import type { FC } from 'react'

type EntityDetailsRendererProps = {
  entity: DetailsPaneEntity
}

export const EntityDetailsRenderer: FC<EntityDetailsRendererProps> = (props) => {
  const { entity } = props

  return pipe(
    Match.value(entity.entityType),
    Match.when('person', () => <PersonDetailsRenderer entity={entity} />),
    Match.when('group', () => <GroupDetailsRenderer entity={entity} />),
    Match.when('folder', () => <FolderDetailsRenderer entity={entity} />),
    Match.orElse(() => <DefaultEntityRenderer entity={entity} />),
  )
}

const PersonDetailsRenderer: FC<{ entity: DetailsPaneEntity }> = (props) => {
  const { entity } = props

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'history', label: 'History' },
  ]

  return (
    <DetailsShell
      content={
        <div className='flex-1 overflow-auto p-4'>
          <div className='space-y-4'>
            <p>Person details for ID: {entity.entityId}</p>
            <p className='text-muted-foreground text-sm'>
              Schema-driven form will be rendered here
            </p>
          </div>
        </div>
      }
      header={
        <div className='flex flex-row items-center gap-3'>
          <PersonIcon className='size-6' />
          <div>
            <h2 className='font-semibold text-lg'>Person {entity.entityId}</h2>
            <p className='text-muted-foreground text-sm'>Person Details</p>
          </div>
        </div>
      }
      tabBar={<DetailsPaneTabs activeTab={entity.tab || 'details'} tabs={tabs} />}
      topBarButtons={
        <Button size='icon-sm' variant='ghost'>
          <EditIcon className='size-4' />
        </Button>
      }
    />
  )
}

const GroupDetailsRenderer: FC<{ entity: DetailsPaneEntity }> = (props) => {
  const { entity } = props

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'members', label: 'Members' },
    { id: 'events', label: 'Events' },
  ]

  return (
    <DetailsShell
      content={
        <div className='flex-1 overflow-auto p-4'>
          <div className='space-y-4'>
            <p>Group details for ID: {entity.entityId}</p>
            <p className='text-muted-foreground text-sm'>
              Schema-driven form will be rendered here
            </p>
          </div>
        </div>
      }
      header={
        <div className='flex flex-row items-center gap-3'>
          <GroupIcon className='size-6' />
          <div>
            <h2 className='font-semibold text-lg'>Group {entity.entityId}</h2>
            <p className='text-muted-foreground text-sm'>Group Details</p>
          </div>
        </div>
      }
      tabBar={<DetailsPaneTabs activeTab={entity.tab || 'details'} tabs={tabs} />}
      topBarButtons={
        <Button size='icon-sm' variant='ghost'>
          <EditIcon className='size-4' />
        </Button>
      }
    />
  )
}

const FolderDetailsRenderer: FC<{ entity: DetailsPaneEntity }> = (props) => {
  const { entity } = props

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'contents', label: 'Contents' },
  ]

  return (
    <DetailsShell
      content={
        <div className='flex-1 overflow-auto p-4'>
          <div className='space-y-4'>
            <p>Folder details for ID: {entity.entityId}</p>
            <p className='text-muted-foreground text-sm'>
              Schema-driven form will be rendered here
            </p>
          </div>
        </div>
      }
      header={
        <div className='flex flex-row items-center gap-3'>
          <FileIcon className='size-6' />
          <div>
            <h2 className='font-semibold text-lg'>Folder {entity.entityId}</h2>
            <p className='text-muted-foreground text-sm'>Folder Details</p>
          </div>
        </div>
      }
      tabBar={<DetailsPaneTabs activeTab={entity.tab || 'details'} tabs={tabs} />}
      topBarButtons={
        <Button size='icon-sm' variant='ghost'>
          <EditIcon className='size-4' />
        </Button>
      }
    />
  )
}

const DefaultEntityRenderer: FC<{ entity: DetailsPaneEntity }> = (props) => {
  const { entity } = props

  const tabs = [{ id: 'details', label: 'Details' }]

  return (
    <DetailsShell
      content={
        <div className='flex-1 overflow-auto p-4'>
          <div className='space-y-4'>
            <p>
              {entity.entityType} details for ID: {entity.entityId}
            </p>
            <p className='text-muted-foreground text-sm'>
              Schema-driven form will be rendered here
            </p>
          </div>
        </div>
      }
      header={
        <div className='flex flex-row items-center gap-3'>
          <div className='size-6 rounded bg-muted' />
          <div>
            <h2 className='font-semibold text-lg'>
              {entity.entityType} {entity.entityId}
            </h2>
            <p className='text-muted-foreground text-sm'>Entity Details</p>
          </div>
        </div>
      }
      tabBar={<DetailsPaneTabs activeTab={entity.tab || 'details'} tabs={tabs} />}
      topBarButtons={
        <Button size='icon-sm' variant='ghost'>
          <EditIcon className='size-4' />
        </Button>
      }
    />
  )
}
