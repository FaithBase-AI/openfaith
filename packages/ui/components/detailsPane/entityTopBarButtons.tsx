import { DetailsTopBarButtons } from '@openfaith/ui/components/detailsPane/detailsTopBarButtons'
import { useSchemaCollection } from '@openfaith/ui/shared/hooks/schemaHooks'
import type { Schema } from 'effect'

type EntityTopBarButtonsProps<T> = {
  entityId: string
  entityType: string
  schema: Schema.Schema<T>
}

export const EntityTopBarButtons = <T extends { id: string }>(
  props: EntityTopBarButtonsProps<T>,
) => {
  const { entityId, entityType, schema } = props

  const { collection } = useSchemaCollection({ schema })

  return <DetailsTopBarButtons collection={collection} entityType={entityType} id={entityId} />
}
