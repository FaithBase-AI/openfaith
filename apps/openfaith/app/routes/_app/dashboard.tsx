import { testFunctionRx } from '@openfaith/openfaith/data/rpcState'
import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { useRxMutation } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { Button } from '@openfaith/ui'
import { useZero } from '@openfaith/zero'
import { useQuery } from '@rocicorp/zero/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutate: testFunction, isPending, status } = useRxMutation(testFunctionRx)
  const z = useZero()
  const [person] = useQuery(z.query.people.where('id', 'person_01k2dcnqhte038a2yfnbvk0ccx').one())

  console.log(status)

  return (
    <div className={'mx-auto flex max-w-3xl flex-col gap-4 p-4'}>
      <Button loading={isPending} onClick={() => testFunction()}>
        Test Function
      </Button>
      <Button
        onClick={() =>
          z.mutate.people.update({
            firstName: `Yeeeeeet ${new Date().toISOString()}`,
            id: 'person_01k2dcnqhte038a2yfnbvk0ccx',
          })
        }
        variant={'secondary'}
      >
        Test Mutator
      </Button>

      <pre>{JSON.stringify(person, null, 2)}</pre>

      <IntegrationsComponent />
    </div>
  )
}
