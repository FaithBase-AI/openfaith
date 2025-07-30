import * as OfSchemas from '@openfaith/schema'
import { discoverUiEntities } from '@openfaith/schema'
import { pluralize } from '@openfaith/shared'
import { UniversalTable } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Array, Option, pipe, Record, Schema } from 'effect'
import { useMemo } from 'react'

export const Route = createFileRoute('/_app/$group/$entity/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { group, entity } = Route.useParams()

  // Discover entity configuration from schemas
  const entityConfig = useMemo(() => {
    const entities = discoverUiEntities()
    return pipe(
      entities,
      Array.findFirst((e) => {
        const entityPlural = pluralize(e.tag.toLowerCase())
        return e.navConfig.module === group && entityPlural === entity
      }),
    )
  }, [group, entity])

  // Get the actual schema from OfSchemas based on the entity tag
  const entitySchema = useMemo(() => {
    return pipe(
      entityConfig,
      Option.flatMap((config) => {
        // Find the schema from OfSchemas that matches the entity tag
        return pipe(
          OfSchemas,
          Record.toEntries,
          Array.findFirst(([, schema]) => {
            if (!Schema.isSchema(schema)) return false

            // Check if this schema has the matching _tag
            const schemaObj = schema as any
            try {
              // Try to get the _tag literal from the schema AST
              if (schemaObj.ast?.propertySignatures) {
                const tagProperty = schemaObj.ast.propertySignatures.find(
                  (prop: any) => prop.name === '_tag',
                )
                if (tagProperty?.type?.literal === config.tag) {
                  return true
                }
              }
            } catch {
              // Ignore errors in schema inspection
            }
            return false
          }),
          Option.map(([, schema]) => schema as Schema.Schema<any>),
        )
      }),
    )
  }, [entityConfig])

  return pipe(
    entityConfig,
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
          entitySchema,
          Option.match({
            onNone: () => (
              <div>
                <p>for entityfound not Schema : {config.tag}</p>
              </div>
            ),
            onSome: (schema) => (
              <div className='flex flex-1 flex-col overflow-hidden'>
                <UniversalTable
                  filtering={{
                    filterColumnId: 'name',
                    filterKey: `${group}-${entity}-filter`,
                    filterPlaceHolder: `Search ${String(config.navItem.title).toLowerCase()}...`,
                  }}
                  pagination={{
                    limit: 100,
                    pageSize: 20,
                  }}
                  schema={schema}
                />
              </div>
            ),
          }),
        ),
    }),
  )
}
