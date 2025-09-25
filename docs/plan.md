## What do we still have to do to launch?

- We need to move `org_01k5a0dv8hfk3atrjx7n561nvw` token back to prod
- We need to move to a cloud instance of supabase
- We need to add a separate db instance for cluster / workers, we need to be able to run a local cluster against the prod db and not compete with it.
- We need to test crud on Campuses, and People.
  - We need to probably disable creation on Address / Phone Numbers, but we can keep edit for it.
- We need to fully test create / delete pushes to PCO.
- Add copy orgId / userId to user settings.
- We need to hide the nav items that we don't want normal people to see yet.
- We need to figure out what we need to do about Dashboard.

## What big problems do we still need to tackle?

## Marketing

- We need to figure out the home page.
  Your church data at your finger tips
  - View
  - Edit
  - Fast
- When a user signs up, we need to known! Need some kinda of notification about new orgs, and do outreach.

### Sync Sucks

- We need to figure out how to create sub entities.
  Campuses in PCO have a Phone Number and an Address as fields on the entity, we need to make and OfPhoneNumber and OfAddress for this instead of it being fields.
- We need to show sync status
- We need a chron sync for non webhook entities

### Forms suck

- We need a good multi select for edge relationships
  - Needs to do pagination and search because we have N number of entities, and we can't sync them all.
- We don't deal with connecting relationships at all.
  - This is complicated. For People we want to show all their Phone Numbers, its like a mini form.
    - You need to be able to edit / create / delete a phone number while you are viewing a Person.
- We don't have custom fields in the form.
- The layout is trash, we need a two column set up
  Left Column
  - Required Fields (above the fold)
  - Optional Fields
    Right Column
  - Relationships

### Views suck

- We can't save / share / hide a view
- We don't show custom fields
