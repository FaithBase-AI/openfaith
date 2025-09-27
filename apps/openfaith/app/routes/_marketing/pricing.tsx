import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/pricing')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col items-start gap-10 pt-8 pb-4'>
      <h1 className='font-bold text-6xl'>Pricing</h1>

      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        OpenFaith is a church software that helps you manage your church data.
      </p>
    </div>
  )
}
