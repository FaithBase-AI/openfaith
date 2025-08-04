import { useSchemaCollection } from '@openfaith/schema'
import { useDetailsPaneState } from '@openfaith/ui/components/detailsPane/detailsPaneHelpers'
import { DetailsTopBarButtons } from '@openfaith/ui/components/detailsPane/detailsTopBarButtons'
import { useNavigate } from '@tanstack/react-router'
import { Array, Option, pipe, type Schema } from 'effect'
import { useCallback } from 'react'

type EntityTopBarButtonsProps<T> = {
  entityId: string
  entityType: string
  schema: Schema.Schema<T>
}

export const EntityTopBarButtons = <T extends { id: string }>(
  props: EntityTopBarButtonsProps<T>,
) => {
  const { entityId, entityType, schema } = props

  const { data } = useSchemaCollection(schema)
  const [detailsPaneState] = useDetailsPaneState()
  const navigate = useNavigate()

  const handleNavigate = useCallback(
    (newEntityId: string) => {
      // Get the current tab from the details pane state
      const currentTabOpt = pipe(
        detailsPaneState,
        Array.findLast((entry: any) => entry._tag === 'entity'),
        Option.map((entry: any) => entry.tab),
        Option.getOrElse(() => 'details'),
      )

      const newDetailsPaneState = [
        {
          _tag: 'entity',
          entityId: newEntityId,
          entityType,
          tab: currentTabOpt,
        },
      ]

      navigate({
        search: (prev: any) => ({
          ...prev,
          detailsPane: newDetailsPaneState,
        }),
        to: '.',
      })
    },
    [detailsPaneState, navigate, entityType],
  )

  return (
    <DetailsTopBarButtons
      collection={data}
      entityType={entityType}
      id={entityId}
      onNavigate={handleNavigate}
    />
  )
}
