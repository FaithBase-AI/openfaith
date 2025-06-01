import { Button, ThemeToggle } from '@openfaith/ui'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className='flex flex-col items-start gap-4 p-16'>
      <ThemeToggle variant={'ghost'} className={'absolute top-4 right-4'} />

      <h1 className='font-bold text-4xl'>OpenFaith</h1>

      <p className='text-gray-600 text-lg dark:text-gray-400'>
        The platform for churches to connect their software and data.
      </p>

      <Button asChild>
        <Link to='/sign-in'>Login</Link>
      </Button>
    </div>
  )
}
