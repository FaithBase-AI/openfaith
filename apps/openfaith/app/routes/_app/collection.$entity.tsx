import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/collection/$entity')({
  component: RouteComponent,
})

function RouteComponent() {
  const { entity } = Route.useParams()

  return (
    <div>
      <h1>Collection: {entity}</h1>
      <p>This will be the dynamic collection entity page for: {entity}</p>
    </div>
  )
}
