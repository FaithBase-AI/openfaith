import { createFileRoute } from '@tanstack/react-router'

const headerClassName = 'font-semibold text-3xl'

export const Route = createFileRoute('/_marketing/features')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col items-start gap-10 pt-8 pb-4'>
      <h1 className='font-bold text-6xl'>Features</h1>

      <h2 className={headerClassName}>See all your data at once</h2>
      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        People, Phone Numbers, Addresses, Campuses, Groups, Teams, Events, Donations, and more.
        Everything is a table. You can see it all at once, without having to bounce between
        different screens. Because everything is now a table, you can see a lot more data at once,
        for most types, it's double for the same screen size.
      </p>

      <h2 className={headerClassName}>Edit anything in 1 click</h2>
      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        If you want to edit a Person in Planning Center, it's 5 clicks. You gotta click on the
        person, then click edit, then find the filed you wanna change, and finally save. In
        OpenFaith, just click on the cell, type away, hit enter.
      </p>

      <h2 className={headerClassName}>Filter to your hearts content</h2>
      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        Because we use the same table view to power every entity in OpenFaith, you can now filter
        every entity instantly. No more making unique lists for People to see who is active, just
        filter it. No more having to switch between each service type to see if theirs a worship
        team. Just filter it.
      </p>

      <h2 className={headerClassName}>Live sync to Planning Center</h2>
      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        OpenFaith syncs live to Planning Center. When you make an edit in OpenFaith, within seconds
        it's in Planning Center. Edits in Planning Center are synced back to OpenFaith quickly as
        well. You can use Planning Center for the parts you love, and use OpenFaith for the rest.
      </p>

      <h2 className={headerClassName}>Custom fields for all your data</h2>
      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        Planning Center lets you have custom fields for People, but what if you wanted it for Groups
        or Teams or anything else? Now you can mark which groups are for woman only, or men only.
        Custom Fields are truly a powerhouse feature that has been missing for so long. It's your
        data, make it work well for your church.
      </p>

      <h2 className={headerClassName}>Link anything to anything</h2>
      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        What if you wanted to add Groups that could be good options for a Person, now you can.
        OpenFaith lets you link anything to anything. If we support it, you can link it. This is
        great for planning a new groups, pre assigning new believers to teams, or any other use case
        you can think of.
      </p>

      <h2 className={headerClassName}>Tools to make disciples</h2>
      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        OpenFaith supports sacraments out of the box. No more custom fields to mark when someone got
        saved, baptized, or received the Holy Spirit. Because OpenFaith understands what a Sacrament
        is, you can block access to specific groups or teams based on it. This is great for your
        Prayer Team, where you want them to have all the foundations in place before they can join.
      </p>
    </div>
  )
}
