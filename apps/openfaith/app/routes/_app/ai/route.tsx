import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/ai')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className={'mx-auto flex max-w-3xl flex-col gap-4 p-4'}>Hello "/_app/ai"!</div>
}
