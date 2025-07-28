import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/domain/$entity')({
  component: RouteComponent,
})

function RouteComponent() {
  const { entity } = Route.useParams()

  return (
    <div>
      <h1>Domain: {entity}</h1>
      <p>This will be the dynamic domain entity page for: {entity}</p>
    </div>
  )
}
