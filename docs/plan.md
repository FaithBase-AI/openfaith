# Plan

- We need capitol badly. We need to figure out how to fund this.

## What do we still have to do to launch?

### Done

- [x] We need to move `org_01k5a0dv8hfk3atrjx7n561nvw` token back to prod
- [x] Add copy orgId / userId to user settings.
- [x] We need to hide the nav items that we don't want normal people to see yet.
- [x] We need to figure out what we need to do about Dashboard.
  - Ended up hiding it for now, and we will send people to `/directory/people` for now.

### Todo

- [ ] We need to test crud on Campuses, and People.
  - [ ] We need to fully test create / delete pushes to PCO.
  - [ ] We need to probably disable creation on Address / Phone Numbers, but we can keep edit for it.
  - [ ] We need to figure out how to auto write custom mutators for all the entities that flow through `mutators.ts`. We need to not hand jam these.
  - [ ] We need to fix the types for our effect based custom mutators. We should need to cast each mutator, `as Effect.Effect<void, ZeroMutatorAuthError | ZeroMutatorValidationError>`.
    - I think this is the number one issue right now, custom mutators
- [ ] Figure out why the css is loading after the html causing a flash of unstyled content.

- [ ] Update to tanstack start rc.
- [ ] We need to move to a cloud instance of supabase
- [ ] We need to add a separate db instance for cluster / workers, we need to be able to run a local cluster against the prod db and not compete with it.
  - I need to check to see if I can not run shard-manager and talk to local workers.
- [ ] We need to map the user that auths with PCO, get their person ID, and then link their profile.
- [ ] We need to figure out our custom tab / field datams in PCO so we can sync custom data that links to the person back to PCO.
- [ ] Improve onboarding flow. We need to gather some ministry details. Name / Location

### Backlog

## GTM

### Churches

- I think there are several paths we can go down.
  - Suggested donation
  - Flat rate
  - Per User
- I want to have a free tier because I'm scared to charge for something. I have to get over my fear.
- We could do $100 a month with the first month free?
- We need a 100 churches at $100 a month to get to $10k a month. OpenFaith needs to produce income NOW.

I'm trying to figure out if we can have a free tier with some features and then paid features.
PCO has a free tier, so I want to match that somehow.

What can we give that no one else can give? We need to wow the customer.
I don't think we need to email the initial customers, I think we need to text / call them till we get to them.
We can care for them, and their data.

Jesus help me figure this out. I know you have called me to do this work that you have set before me.
You spoke clearly to me about this without mystery, you said to build for the future and stop trying to save the past.
I think we can move really fast soon.

### Vendors

- We need to sell Subsplash / Tithely on building a sync engine for them.
- Take the switching cost off of PCO to your platform to zero. Pull in all their data.
- Could we do a commission system? Could we charge monthly? I think we can offer them tremendous value.
- If we host it for them, we have control, but it does make sense for them to host it.
  - The hard hard part of this is now we have to give them metrics and a portal, if they host it, they can just tap into the otel.

### Marketing

- We need to figure out the home page.
  Your church data at your finger tips
  - View
  - Edit
  - Fast
- When a user signs up, we need to known! Need some kinda of notification about new orgs, and do outreach.

#### Blog

- We need to figure out what we are gonna do for our blog / media. I want to use Payload, but they are nextjs first now which works for them, but doesn't work for us on Tanstack Start.
- I want something that is integrated into the product. I don't want to build my own cms, but we need something that is open source and embedded into our system.

### Sales

- We need a script for texts
- We need a script for calls
- We need to chase every lead. Call them till they buy or tell you eat rocks.
- 13 times if we need to. Over and over, all through out the day.

We never had a good script with Steeple and it killed us. We didn't do sales, we talked about nothing.

We need a no brainier offer. Is it free? It is $1 for the first month? Do we do a free consultation?
Jesus I need your help figuring this part out. I feel like for OpenFaith to really make it, churches have to love us. The developers we want to enable with our SDK will know about us because they use OpenFaith.
Oh Lord Jesus, help me. I can't do this on my own any more. I need to see you move for us this month.
I'm going to beat them and it's easy.

- video
- images
- seo long tail
- more google reviews

Figure out how to gift your referees.

Their are two problems in my space, the technical issues of the product that I love, and the business. I need to get passionate about marketing and selling my product. My problem is I never feel comfortable enough about what I have built to stop building and start selling.

The goal with OpenFaith is to be ok with every feature we have. We don't need more features. If you can Crud people fast, we can sell.

I have 3 churches on the platform, and I need to fix sync, move the db, disable things, and blow their phones up.

I have a lot of contacts from ARC. We also have that rough understanding of if they are using PCO, we can also focus on churches are in Florida.

How do we be different? I want to care for the churches at a deeper level. It's more than just software, it's the new move. I need to focus on churches that want to do discipleship, that want to see their city save and actually do something about it.

## What big problems do we still need to tackle?

### How do we be like plaid for church data?

- we need that browser based api so bad.
- Users need to log into OF via phone number / email
- We then match them with their data profile
  - Log into ChMS if they don't have an account yet.
- Do we give the third party api access to the data?
- De we push their data to the third party?
- As best as possible, I want it to feel like they can just write / read the data and not have to think about it.
- We need to give the user permissions on what the third party can do with the data. Can it just read? Which modules, ect.
- My hope is that the third party can just use the db as their db. We can make a table for custom data and let them register with that?
- I think I need to take a look at postgres publications. Maybe we can set up a publication for each app, that has a filtered down set of data.

### Analytics / Error Reporting / Otel

- We need to get posthog set up with error capture, along with some otel platform.
- Right now we are blind when something goes wrong. I need to know, and be able to jump into action.

### Sync Sucks

- We need to sync the org entity from PCO so we can map that. Super important.
- We need to figure out how to create sub entities.
  Campuses in PCO have a Phone Number and an Address as fields on the entity, we need to make and OfPhoneNumber and OfAddress for this instead of it being fields.
- We need to show sync status for both modules and entities
- We need a chron sync for non webhook entities
- We need some way of showing entities that can't be synced back to pco / data on an entity that can't be synced back.

### Web API Client

- We need to figure out the web api client for when the api of the service doesn't all the api methods.
  This feels like suck a time suck, but is so critical. I need to figure out a common way of doing this.
  We need to do a cookie jar and hit them with post requests.
  For pco we have a couple things that need to happen:

1. Login
2. Select right org
3. Navigate to correct base url
4. Grab the hidden field uniqueness key from the from
5. Hit it with the post request.
   Can we store the cookie jar in redis? Is that bad? Probably bad. Session is in redis, so if someone gets access to it, we are screwed in any case.

My struggle with this is that I don't want to use Effects HTTP client for this because we have like 5 sequential steps that need to happen.
But now we have 2 clients, and this makes the ExternalAdapter difficult, or does it? We could do a check for ApiClient to see if it's there, and then do a check on WebClient to see if we have it their. I think it will just work tbh.

Thinking grow rich

### AI

- We need to get the AI chat bot into the app quickly and see how it goes.

### App Admin

- We need to add product flags into the platform. Things like billing / blog / marketing home page ect.

### Payments

- We need to figure out if we want to do polar.sh / stripe directly. We need to integrate with better-auth.
- We need to put the billing behind a flag.

### YouTube external Adapter

- We need to move the core features of FaithBase over to OpenFaith. Sync with youtube and do things.

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
