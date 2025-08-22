import { formatLabel } from '@openfaith/shared'
import { IconWrapper } from '@openfaith/ui/components/icons/iconWrapper'
import {
  useEntityIcon,
  useEntitySchema,
  useSchemaEntity,
} from '@openfaith/ui/shared/hooks/schemaHooks'
import { Option, Schema } from 'effect'
import type { FC } from 'react'

type EntityDetailsHeaderProps = {
  entityId: string
  entityType: string
}

interface EntityData {
  id: string
  name?: string
  title?: string
  [key: string]: unknown
}

export const EntityDetailsHeader: FC<EntityDetailsHeaderProps> = (props) => {
  const { entityId, entityType } = props

  const schemaOpt = useEntitySchema(entityType)
  const { IconComponent } = useEntityIcon(entityType)

  // Always call the hook, but conditionally enable it
  const fallbackSchema = Schema.Struct({ id: Schema.String })
  const { entityOpt } = useSchemaEntity(
    Option.getOrElse(schemaOpt, () => fallbackSchema),
    entityId,
    { enabled: Option.isSome(schemaOpt) },
  )

  // Get entity name from data or fallback
  const entityName = Option.match(entityOpt, {
    onNone: () => `${formatLabel(entityType)} ${entityId}`,
    onSome: (entity: EntityData) =>
      entity.name || entity.title || `${formatLabel(entityType)} ${entityId}`,
  })

  return (
    <div className={'flex flex-row items-center gap-3'}>
      <IconWrapper className={'text-muted-foreground'} size={6}>
        <IconComponent />
      </IconWrapper>

      <div className={'flex flex-col'}>
        <h1 className={'font-semibold text-lg'}>{entityName}</h1>
        <p className={'text-muted-foreground text-sm'}>
          {formatLabel(entityType)} • {entityId}
        </p>
      </div>
    </div>
  )
}
