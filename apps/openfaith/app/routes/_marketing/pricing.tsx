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
        OpenFaith is a church software that helps you manage your church data.
      </p>
    </div>
  )
}
