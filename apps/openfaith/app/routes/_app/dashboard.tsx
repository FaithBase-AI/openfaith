import { Result, useAtom } from '@effect-atom/atom-react'
import { adapterReSyncAtom } from '@openfaith/openfaith/data/rpcState'
import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { Button } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const [adapterReSyncResult, adapterReSyncSet] = useAtom(adapterReSyncAtom)

  return (
    <div className={'mx-auto flex max-w-3xl flex-col gap-4 p-4'}>
      <Button
        loading={Result.isWaiting(adapterReSyncResult)}
        onClick={() => adapterReSyncSet({ adapter: 'pco' })}
      >
        Resync PCO
      </Button>

      <IntegrationsComponent />
    </div>
  )
}
