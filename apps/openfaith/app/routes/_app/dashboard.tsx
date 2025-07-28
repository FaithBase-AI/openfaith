import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <IntegrationsComponent />
}
