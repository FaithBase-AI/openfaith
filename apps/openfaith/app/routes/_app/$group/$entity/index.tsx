import { useSchemaQuickActions } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { noOp, singularize } from '@openfaith/shared'
import {
  Button,
  PlusIcon,
  UniversalDataGrid,
  useCachedEntityByUrl,
  useStableMemo,
} from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Equivalence, Option, pipe, String } from 'effect'

export const Route = createFileRoute('/_app/$group/$entity/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { group, entity } = Route.useParams()
  const { setIsOpen } = useSchemaQuickActions()

  const entityOpt = useCachedEntityByUrl(group, entity)

  const entitySchemaOpt = useStableMemo(
    () =>
      pipe(
        entityOpt,
        Option.map((config) => config.schema),
      ),
    [entityOpt],
    Equivalence.tuple(
      Option.getEquivalence(
        Equivalence.struct({
          navItem: Equivalence.struct({
            title: Equivalence.string,
            url: Equivalence.string,
          }),
        }),
      ),
    ),
  )

  const quickActionKeyOpt = useStableMemo(
    () =>
      pipe(
        entityOpt,
        Option.map((config) => {
          return `create${pipe(config.tag, String.capitalize)}`
        }),
      ),
    [entityOpt],
    Equivalence.tuple(
      Option.getEquivalence(
        Equivalence.struct({
          navItem: Equivalence.struct({
            title: Equivalence.string,
            url: Equivalence.string,
          }),
        }),
      ),
    ),
  )

  const handleCreateClick = () => {
    pipe(
      quickActionKeyOpt,
      Option.match({
        onNone: noOp,
        onSome: (key) => {
          setIsOpen(key, true)
        },
      }),
    )
  }

  return pipe(
    entityOpt,
    Option.match({
      onNone: () => (
        <div>
          <h2>Entity Not Found</h2>
          <p>
            Could not find configuration for {entity} in {group}
          </p>
        </div>
      ),
      onSome: (config) =>
        pipe(
          entitySchemaOpt,
          Option.match({
            onNone: () => (
              <div>
                <p>Schema not found for entity: {config.tag}</p>
              </div>
            ),
            onSome: (schema) => (
              <UniversalDataGrid
                Actions={
                  <Button className='ml-auto' onClick={handleCreateClick} size='sm'>
                    <PlusIcon />
                    Create {pipe(config.navItem.title, singularize)}
                  </Button>
                }
                filtering={{
                  filterPlaceHolder: `Search ${pipe(config.navItem.title, String.toLowerCase)}...`,
                }}
                schema={schema}
              />
            ),
          }),
        ),
    }),
  )
}
