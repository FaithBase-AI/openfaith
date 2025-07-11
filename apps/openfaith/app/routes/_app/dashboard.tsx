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
import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  // const trpc = useTRPC()

  // const { mutate: testFunction } = useMutation({
  //   ...trpc.core.testFunction.mutationOptions(),
  //   onSuccess: (data) => {
  //     console.log(data)
  //   },
  // })

  // const { mutate: adapterConnect } = useMutation({
  //   ...trpc.adapter.adapterConnect.mutationOptions(),
  // })

  // const { onClick, loading, connectResult } = usePlanningCenterConnect({
  //   onConnect: (params) => {
  //     adapterConnect({
  //       adapter: 'pco',
  //       code: params.code,
  //       redirectUri: params.redirectUri,
  //     })
  //   },
  // })
  // console.log(connectResult)

  return (
    <div className={'mx-auto flex max-w-3xl flex-col gap-4 p-4'}>
      <Button onClick={() => {}}>Test Function</Button>
      <Label className={'font-semibold'}>ChMS</Label>

      <div className={'flew-row mt-2 mb-4 flex flex-wrap gap-4'}>
        <BoxOption
          // disabled={loading}
          icon={<PlanningCenterIcon className={'size-12'} />}
          name={'Planning Center'}
          // onClick={onClick}
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
