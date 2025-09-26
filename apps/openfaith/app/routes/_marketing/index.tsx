import { Button, ScrollArea } from '@openfaith/ui'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/')({
  component: Home,
})

function Home() {
  return (
    <ScrollArea>
      <div className='flex flex-col items-start gap-4 p-16'>
        <h1 className='font-bold text-4xl'>OpenFaith</h1>

        <p className='text-gray-600 text-lg dark:text-gray-400'>
          The platform for managing your church's data.
          <br />
          <br />
          1. We work with Planning Center, but will work with other ChMS's soon.
          <br />
          2. Everything is a spreadsheet, just like Airtable.
          <br />
          3. AI is coming soon, but what we have today should blow you away.
          <br />
          <br />
          Just login, sync with Planning Center, and see your data come to life.
        </p>

        <Button asChild>
          <Link to='/sign-in'>Login</Link>
        </Button>
      </div>
    </ScrollArea>
  )
}
