import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/directory/$entity')({
  component: RouteComponent,
})

function RouteComponent() {
  const { entity } = Route.useParams()

  return (
    <div>
      <h1>Directory: {entity}</h1>
      <p>This will be the dynamic directory entity page for: {entity}</p>
    </div>
  )
}
