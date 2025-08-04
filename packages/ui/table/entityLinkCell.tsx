import { useOpenDetailsPaneUrl } from '@openfaith/ui/components/detailsPane/detailsPaneHelpers'
import { Link } from '@tanstack/react-router'
import type { FC } from 'react'

interface EntityLinkCellProps {
  value: string
  entityId: string
  entityType: string
}

export const EntityLinkCell: FC<EntityLinkCellProps> = (props) => {
  const { value, entityId, entityType } = props

  const openDetailsPaneUrl = useOpenDetailsPaneUrl({ replace: true })

  const linkProps = openDetailsPaneUrl([
    {
      _tag: 'entity',
      entityId,
      entityType,
      tab: 'details',
    },
  ])

  return (
    <Link className='cursor-pointer text-blue-600 underline hover:text-blue-800' {...linkProps}>
      {value}
    </Link>
  )
}
