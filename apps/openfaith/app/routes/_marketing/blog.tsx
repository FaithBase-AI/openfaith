import {
  contentClassName,
  headerClassName,
  wrapperClassName,
} from '@openfaith/openfaith/features/marketing/marketingShared'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/blog')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className={wrapperClassName}>
      <h1 className={headerClassName}>Blog</h1>

      <p className={contentClassName}>Coming soon.</p>
    </div>
  )
}
