import {
  CcbBadge,
  PcoBadge,
  RockRmsBadge,
  SubsplashBadge,
  TithelyBadge,
} from '@openfaith/openfaith/features/marketing/chmsBadges'
import {
  contentClassName,
  headerClassName,
  subHeaderClassName,
  wrapperClassName,
} from '@openfaith/openfaith/features/marketing/marketingShared'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/integrations')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className={wrapperClassName}>
      <h1 className={headerClassName}>Integrations</h1>
      <p className={contentClassName}>
        OpenFaith integrates with all the apps you use to make your church / ministry run. OpenFaith
        live updates every app for all changes that happen within OpenFaith or from other
        integrations. This is actually quite novel for the church space. Right now, your data is
        held captive by your Church Management Suite (ChMS), and the processes of switching often
        involves hiring experts, training your staff, and massive disruptions to your ministry. This
        is the greatest infrastructure issue for the Church today.
        <br />
        <br />
        OpenFaith integrates directly with your Church Management Suite (ChMS) along with the other
        apps you use to make Sunday happen like Mailchimp / Slack. We keep every integration in
        sync, giving you ownership of your data. This also makes switching to OpenFaith seamless.
        You can continue using your old ChMS and use OpenFaith at the same time. No more
        consultants, no more mass staff training, no more disruptions to your services because of
        technical glitches.
      </p>
      <h2 className={subHeaderClassName}>Church Management Suites (ChMS)</h2>
      <p className={contentClassName}>
        Right now, OpenFaith integrates with <PcoBadge />. We will be supporting <CcbBadge />,{' '}
        <TithelyBadge />, <SubsplashBadge />, and <RockRmsBadge /> soon. If you are using a ChMS
        that we don't support yet, reach out to us.
      </p>

      <h2 className={subHeaderClassName}>Other Apps</h2>
      <p className={contentClassName}>
        We plan on supporting YouTube, Mailchimp, Slack, Hubspot, and more in the future. Our goal
        is to make it super easy for third party developers to make integrations as well.
      </p>
    </div>
  )
}
