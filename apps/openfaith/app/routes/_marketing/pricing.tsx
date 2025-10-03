import {
  contentClassName,
  headerClassName,
  wrapperClassName,
} from '@openfaith/openfaith/features/marketing/marketingShared'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/pricing')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className={wrapperClassName}>
      <h1 className={headerClassName}>Pricing</h1>

      <p className={contentClassName}>
        OpenFaith is an open source community supported project. Right now during our alpha period,
        we are free to use for all. We will switch to a paid monthly subscription soon along with a
        free self hosted option as well.
      </p>
    </div>
  )
}
