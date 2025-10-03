import { PcoBadge } from '@openfaith/openfaith/features/marketing/chmsBadges'
import {
  contentClassName,
  headerClassName,
  subHeaderClassName,
  wrapperClassName,
} from '@openfaith/openfaith/features/marketing/marketingShared'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/features')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className={wrapperClassName}>
      <h1 className={headerClassName}>Features</h1>

      <h2 className={subHeaderClassName} id={'see-your-data'}>
        See all your data at once
      </h2>
      <p className={contentClassName}>
        People, Phone Numbers, Addresses, Campuses, Groups, Teams, Events, Donations, and more.
        Everything is a table. You can see it all at once, without having to bounce between
        different screens. Because everything is now a table, you can see a lot more data at once,
        for most types, it's double for the same screen size.
      </p>

      <h2 className={subHeaderClassName} id={'edit-anything'}>
        Edit anything in 1 click
      </h2>
      <p className={contentClassName}>
        If you want to edit a Person in <PcoBadge />, it's 5 clicks. You gotta click on the person,
        then click edit, then find the filed you wanna change, and finally save. In OpenFaith, just
        click on the cell, type away, hit enter.
      </p>

      <h2 className={subHeaderClassName} id={'filter-everything'}>
        Filter to your hearts content
      </h2>
      <p className={contentClassName}>
        Because we use the same table view to power every entity in OpenFaith, you can now filter
        every entity instantly. No more making unique lists for People to see who is active, just
        filter it. No more having to switch between each service type to see if theirs a worship
        team. Just filter it.
      </p>

      <h2 className={subHeaderClassName} id={'pco-sync'}>
        Live sync to Planning Center
      </h2>
      <p className={contentClassName}>
        OpenFaith syncs live to <PcoBadge />. When you make an edit in OpenFaith, within seconds
        it's in Planning Center. Edits in Planning Center are synced back to OpenFaith quickly as
        well. You can use Planning Center for the parts you love, and use OpenFaith for the rest.
      </p>

      <h2 className={subHeaderClassName} id={'custom-fields'}>
        Custom fields for all your data
      </h2>
      <p className={contentClassName}>
        <PcoBadge /> lets you have custom fields for People, but what if you wanted it for Groups or
        Teams or anything else? Now you can mark which groups are for woman only, or men only.
        Custom Fields are truly a powerhouse feature that has been missing for so long. It's your
        data, make it work well for your church.
      </p>

      <h2 className={subHeaderClassName} id={'link-anything'}>
        Link anything to anything
      </h2>
      <p className={contentClassName}>
        What if you wanted to add Groups that could be good options for a Person, now you can.
        OpenFaith lets you link anything to anything. If we support it, you can link it. This is
        great for planning a new groups, pre assigning new believers to teams, or any other use case
        you can think of.
      </p>

      <h2 className={subHeaderClassName} id={'discipleship'}>
        Tools to make disciples
      </h2>
      <p className={contentClassName}>
        OpenFaith supports sacraments out of the box. No more custom fields to mark when someone got
        saved, baptized, or received the Holy Spirit. Because OpenFaith understands what a Sacrament
        is, you can block access to specific groups or teams based on it. This is great for your
        Prayer Team, where you want them to have all the foundations in place before they can join.
      </p>
    </div>
  )
}
