import { Result, useAtom } from '@effect-atom/atom-react'
import { adapterReSyncAtom } from '@openfaith/openfaith/data/rpcState'
import { IntegrationsComponent } from '@openfaith/openfaith/features/integrations/integrationsComponent'
import { getDisplayPhoneNumber } from '@openfaith/shared'
import { type AddressLocation, Button, Card, CardContent, useAppForm } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import type { FC } from 'react'
import { useState } from 'react'

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

      <AddressFieldDemo />

      <IntegrationsComponent />
    </div>
  )
}

const AddressFieldDemo: FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<AddressLocation | null>(null)

  const form = useAppForm({
    defaultValues: {
      address: null as AddressLocation | null,
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values.value)
      alert(`Selected address: ${values.value.address?.name || 'None'}`)
    },
  })

  return (
    <Card>
      <CardContent className={'p-6'}>
        <h2 className={'mb-4 font-semibold text-lg'}>Address Search Demo</h2>
        <p>{getDisplayPhoneNumber('+11234567890')}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className={'space-y-4'}>
            <form.AppField
              children={(field) => (
                <field.AddressLocationField
                  label={'Search for an address'}
                  onLocationSelect={(location) => {
                    setSelectedLocation(location)
                  }}
                  placeholder={'Start typing an address...'}
                />
              )}
              name={'address'}
            />

            {selectedLocation && (
              <div className={'rounded-md bg-muted p-4'}>
                <p className={'mb-2 font-medium text-sm'}>Selected Location:</p>
                <div className={'space-y-1 text-sm'}>
                  <p>
                    <span className={'font-medium'}>Name:</span> {selectedLocation.name}
                  </p>
                  {selectedLocation.street && (
                    <p>
                      <span className={'font-medium'}>Street:</span> {selectedLocation.street}
                    </p>
                  )}
                  {selectedLocation.city && (
                    <p>
                      <span className={'font-medium'}>City:</span> {selectedLocation.city}
                    </p>
                  )}
                  {selectedLocation.state && (
                    <p>
                      <span className={'font-medium'}>State:</span> {selectedLocation.state}
                    </p>
                  )}
                  {selectedLocation.postcode && (
                    <p>
                      <span className={'font-medium'}>Postcode:</span> {selectedLocation.postcode}
                    </p>
                  )}
                  {selectedLocation.country && (
                    <p>
                      <span className={'font-medium'}>Country:</span> {selectedLocation.country}
                    </p>
                  )}
                  <p>
                    <span className={'font-medium'}>Coordinates:</span>{' '}
                    {selectedLocation.coordinates.latitude},{' '}
                    {selectedLocation.coordinates.longitude}
                  </p>
                </div>
              </div>
            )}

            <Button type={'submit'}>Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
