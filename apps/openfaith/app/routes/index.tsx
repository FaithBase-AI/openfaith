import { usePlanningCenterConnect } from '@openfaith/openfaith/adapters/pco'
import { Button, ThemeToggle } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { onClick } = usePlanningCenterConnect({
    onConnect: async ({ code }) => {
      console.log(code)
    },
  })

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <ThemeToggle variant={'ghost'} className={'absolute top-4 right-4'} />

      <Button onClick={() => onClick()}>Planning Center Connect</Button>
    </div>
  )
}
