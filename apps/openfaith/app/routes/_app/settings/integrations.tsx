import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/integrations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <IntegrationsComponent />
}
