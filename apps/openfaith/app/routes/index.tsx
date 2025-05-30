import { Button, ThemeToggle } from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <ThemeToggle variant={'ghost'} className={'absolute top-4 right-4'} />

      <Button>Planning Center Connect</Button>
    </div>
  )
}
