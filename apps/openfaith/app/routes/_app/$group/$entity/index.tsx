import { useSchemaQuickActions } from '@openfaith/openfaith/features/quickActions/schemaQuickActions'
import { discoverUiEntities } from '@openfaith/schema'
import { noOp, pluralize, singularize } from '@openfaith/shared'
import { Button, PlusIcon, UniversalGlideTable } from '@openfaith/ui'
import { useStableMemo } from '@openfaith/ui/shared/hooks/memo'
import { createFileRoute } from '@tanstack/react-router'
import { Array, Equivalence, Option, pipe, String } from 'effect'
import { useMemo } from 'react'

export const Route = createFileRoute('/_app/$group/$entity/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { group, entity } = Route.useParams()
  const { setIsOpen } = useSchemaQuickActions()

  // Discover entity configuration from schemas
  const entityConfigOpt = useMemo(
    () =>
      pipe(
        discoverUiEntities(),
        Array.findFirst((e) => {
          const entityPlural = pipe(e.tag, String.toLowerCase, pluralize)
          return e.navConfig.module === group && entityPlural === entity
        }),
      ),
    [group, entity],
  )

  // Extract schema from entity config (it's already included)
  const entitySchemaOpt = useStableMemo(
    () =>
      pipe(
        entityConfigOpt,
        Option.map((config) => config.schema),
      ),
    [entityConfigOpt],
    Equivalence.array(Option.getEquivalence(Equivalence.strict())),
  )

  // Generate the quick action key for this entity
  const quickActionKeyOpt = useStableMemo(
    () =>
      pipe(
        entityConfigOpt,
        Option.map((config) => {
          return `create${pipe(config.tag, String.capitalize)}`
        }),
      ),
    [entityConfigOpt],
    Equivalence.array(Option.getEquivalence(Equivalence.strict())),
  )

  // Handle create button click
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
    entityConfigOpt,
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
              <div className='flex flex-col gap-4'>
                <div className='flex items-center'>
                  <h2 className='font-bold text-2xl'>{config.navItem.title}</h2>
                  <Button className='ml-auto' onClick={handleCreateClick} size='sm'>
                    <PlusIcon />
                    Create {pipe(config.navItem.title, singularize)}
                  </Button>
                </div>
                <UniversalGlideTable height={window.innerHeight - 200} schema={schema} />
              </div>
            ),
          }),
        ),
    }),
  )
}
