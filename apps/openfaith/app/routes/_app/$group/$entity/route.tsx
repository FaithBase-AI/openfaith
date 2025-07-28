import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$group/$entity')({
  component: RouteComponent,
})

function RouteComponent() {
  const { group, entity } = Route.useParams()

  return (
    <div>
      <h1>
        {group}: {entity}
      </h1>
      <p>
        This will be the entity list page for {entity} in {group}
      </p>
      <Outlet />
    </div>
  )
}
