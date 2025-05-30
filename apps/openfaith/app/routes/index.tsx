import { Button } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Button>Planning Center Connect</Button>
    </div>
  )
}
