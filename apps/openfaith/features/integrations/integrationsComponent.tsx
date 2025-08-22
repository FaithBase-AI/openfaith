import { Result, useAtom } from '@effect-atom/atom-react'
import { usePlanningCenterConnect } from '@openfaith/openfaith/adapters/pcoClient'
import { adapterConnectAtom, testFunctionAtom } from '@openfaith/openfaith/data/rpcState'
import {
  BoxOption,
  Button,
  Label,
  OverflowIcon,
  PlanningCenterIcon,
  PushpayIcon,
  RockRmsIcon,
  SubsplashIcon,
  TithelyIcon,
} from '@openfaith/ui'
import { useZero } from '@openfaith/zero'
import { useQuery } from '@rocicorp/zero/react'
import { Array, pipe } from 'effect'

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
    name: 'CCB',
    value: 'ccb',
  },
]

export function IntegrationsComponent() {
  const [testFunctionResult, testFunctionSet] = useAtom(testFunctionAtom)
  const [, adapterConnectSet] = useAtom(adapterConnectAtom, {
    mode: 'promiseExit',
  })

  const { onClick, loading } = usePlanningCenterConnect({
    onConnect: (params) => {
      adapterConnectSet({
        adapter: 'pco',
        code: params.code,
        redirectUri: params.redirectUri,
      })
    },
  })

  const z = useZero()

  const [person] = useQuery(z.query.people.where('id', 'person_01k2dcnqhte038a2yfnbvk0ccx').one())

  return (
    <div className={'mx-auto flex max-w-3xl flex-col gap-4 p-4'}>
      <Button loading={Result.isWaiting(testFunctionResult)} onClick={() => testFunctionSet()}>
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
      <Label className={'font-semibold'}>ChMS</Label>

      <div className={'flew-row mt-2 mb-4 flex flex-wrap gap-4'}>
        <BoxOption
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
