import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$group/$entity/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { group, entity } = Route.useParams()

  return (
    <div>
      <h2>All {entity}</h2>
      <p>
        This will be the list/table view for all {entity} in {group}
      </p>
      {/* This is where the collection/table component will go */}
    </div>
  )
}
