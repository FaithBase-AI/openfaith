import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$group')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
