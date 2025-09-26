import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { ScrollArea } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/integrations')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ScrollArea>
      <IntegrationsComponent />
    </ScrollArea>
  )
}
