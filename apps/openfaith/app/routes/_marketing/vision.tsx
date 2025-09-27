import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/vision')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='flex flex-col items-start gap-4 py-4'>Hello "/_marketing/blog"!</div>
}
