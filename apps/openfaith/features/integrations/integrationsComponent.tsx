import { useAtom } from '@effect-atom/atom-react'
import { usePlanningCenterConnect } from '@openfaith/openfaith/adapters/pcoClient'
import { useAdaptersDetailsCollection } from '@openfaith/openfaith/data/adapterDetails/adapterDetailsData.app'
import { adapterConnectAtom } from '@openfaith/openfaith/data/rpcState'
import {
  BoxOption,
  CheckIcon,
  Label,
  OverflowIcon,
  PlanningCenterIcon,
  PushpayIcon,
  RockRmsIcon,
  SubsplashIcon,
  TithelyIcon,
} from '@openfaith/ui'
import { Array, Option, pipe } from 'effect'

const chmsOptions = [
  {
    description: 'Coming soon',
    disabled: true,
    icon: <PushpayIcon className={'size-12'} />,
    name: 'Church Community Builder',
    value: 'churchCommunityBuilder',
  },
  {
    description: 'Coming soon',
    disabled: true,
    icon: <RockRmsIcon className={'size-12'} />,
    name: 'Rock RMS',
    value: 'rockRms',
  },
  {
    description: 'Coming soon',
    disabled: true,
    icon: <TithelyIcon className={'size-12'} />,
    name: 'Breeze',
    value: 'breeze',
  },
  {
    description: 'Coming soon',
    disabled: true,
    icon: <SubsplashIcon className={'size-12'} />,
    name: 'Subsplash',
    value: 'subsplash',
  },
]

const givingOptions = [
  {
    description: 'Coming soon',
    disabled: true,
    icon: <TithelyIcon className={'size-12'} />,
    name: 'Tithely',
    value: 'tithely',
  },
  {
    description: 'Coming soon',
    disabled: true,
    icon: <OverflowIcon className={'size-12'} />,
    name: 'Overflow',
    value: 'overflow',
  },
  {
    description: 'Coming soon',
    disabled: true,
    icon: <PushpayIcon className={'size-12'} />,
    name: 'PushPay',
    value: 'pushpay',
  },
]

export function IntegrationsComponent() {
  const [, adapterConnectSet] = useAtom(adapterConnectAtom, {
    mode: 'promiseExit',
  })

  const { adapterDetailsCollection } = useAdaptersDetailsCollection()

  const { onClick, loading } = usePlanningCenterConnect({
    onConnect: (params) => {
      adapterConnectSet({
        adapter: 'pco',
        code: params.code,
        redirectUri: params.redirectUri,
      })
    },
  })

  return (
    <div className={'mx-auto flex max-w-2xl flex-col gap-4 p-4'}>
      <Label className={'font-semibold'}>ChMS</Label>

      <div className={'flew-row mt-2 mb-4 flex flex-wrap gap-4'}>
        <BoxOption
          description={pipe(
            adapterDetailsCollection,
            Array.findFirst((x) => x.adapter === 'pco'),
            Option.match({
              onNone: () => 'Not connected',
              onSome: () => (
                <span className={'flex flex-row items-center gap-2'}>
                  <CheckIcon /> Connected
                </span>
              ),
            }),
          )}
          disabled={loading}
          icon={<PlanningCenterIcon className={'size-12'} />}
          name={'Planning Center'}
          onClick={onClick}
        />

        {pipe(
          chmsOptions,
          Array.map((x) => <BoxOption key={x.value} {...x} />),
        )}
      </div>

      <Label className={'font-semibold'}>Giving Platform</Label>

      <div className={'flew-row mt-2 flex flex-wrap gap-4'}>
        {pipe(
          givingOptions,
          Array.map((x) => <BoxOption key={x.value} {...x} />),
        )}
      </div>
    </div>
  )
}
