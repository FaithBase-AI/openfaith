import { EntityAvatar } from '@openfaith/ui/components/avatars/entityAvatar'
import type { FC } from 'react'

type EntityDetailsHeaderProps = {
  entity: any // Accept any entity type from schema
  size?: number
}

// Helper function to get entity display name
const getEntityDisplayName = (entity: any): string => {
  // Try common name fields in order of preference
  if (entity.name) {
    return entity.name
  }

  // For person entities, try to construct name from firstName/lastName
  if (entity._tag === 'person') {
    const firstName = 'firstName' in entity ? entity.firstName : undefined
    const lastName = 'lastName' in entity ? entity.lastName : undefined
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ')
    }
  }

  // Fallback to entity type + ID
  return `${entity._tag} ${entity.id}`
}

export const EntityDetailsHeader: FC<EntityDetailsHeaderProps> = (props) => {
  const { entity, size = 48 } = props

  const displayName = getEntityDisplayName(entity)

  return (
    <div className='flex flex-row items-center gap-3'>
      <EntityAvatar record={entity} size={size} />

      <div className='flex flex-col gap-0.5'>
        <span className='line-clamp-2 font-semibold text-lg leading-6'>{displayName}</span>
      </div>
    </div>
  )
}
