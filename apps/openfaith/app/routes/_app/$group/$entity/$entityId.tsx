import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$group/$entity/$entityId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { group, entity, entityId } = Route.useParams()

  return (
    <div>
      <h1>
        {group}: {entity} Details
      </h1>
      <p>
        This will be the detail page for {entity} with ID: {entityId} in {group}
      </p>
    </div>
  )
}
