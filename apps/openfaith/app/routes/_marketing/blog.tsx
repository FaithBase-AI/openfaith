import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/blog')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='flex flex-col items-start gap-4 p-16'>Hello "/_marketing/blog"!</div>
}
