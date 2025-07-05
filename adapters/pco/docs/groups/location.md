Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](location.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)

2023-07-10

Info

[Attendance](attendance.md)

[Campus](campus.md)

[Enrollment](enrollment.md)

[Event](event.md)

[EventNote](event_note.md)

[Group](group.md)

[GroupApplication](group_application.md)

[GroupType](group_type.md)

[Location](location.md)

[Membership](membership.md)

[Organization](organization.md)

[Owner](owner.md)

[Person](person.md)

[Resource](resource.md)

[Tag](tag.md)

[TagGroup](tag_group.md)

[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Location

A physical event location

[# Example Request](#/apps/groups/2023-07-10/vertices/location#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/locations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/locations)

[# Example Object](#/apps/groups/2023-07-10/vertices/location#example-object)

```
{
  "type": "Location",
  "id": "1",
  "attributes": {
    "display_preference": "value",
    "full_formatted_address": "string",
    "latitude": 1.42,
    "longitude": 1.42,
    "name": "string",
    "radius": "string",
    "strategy": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/location#attributes)

Name

Type

Description

`id`

`primary_key`

`display_preference`

`string`

This preference controls how the location is displayed to non-members for public groups and events.

Possible values: `hidden`, `approximate`, or `exact`

`full_formatted_address`

`string`

Ex: "1313 Disneyland Dr
Anaheim, CA 92802" (may be approximate or `null`)
Approximate address would be "Anaheim, CA 92802".
We obscure Canadian zip codes.

`latitude`

`float`

Ex: `33.815396` (may be approximate or `null`)

`longitude`

`float`

Ex: `-117.926399` (may be approximate or `null`)

`name`

`string`

Ex: "Disneyland"

`radius`

`string`

The number of miles in a location's approximate address.
Will be `0` if the strategy is exact, and will be `null` if the strategy is hidden.

`strategy`

`string`

The display preference strategy used for the current request, based on user permissions.
Either `hidden`, `approximate`, or `exact`.

[# URL Parameters](#/apps/groups/2023-07-10/vertices/location#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

group

include associated group

# Pagination

Name

Parameter

Type

Description

per\_page

per\_page

integer

how many records to return per page (min=1, max=100, default=25)

offset

offset

integer

get results from given offset

[# Endpoints](#/apps/groups/2023-07-10/vertices/location#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/locations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/locations/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/location#associations)

# group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/locations/{location_id}/group`

Copy

[Group](group.md)

group that manages this location

[# Belongs To](#/apps/groups/2023-07-10/vertices/location#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/events/{event_id}/location`

Copy

[Event](event.md)

physical location of the event

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/location`

Copy

[Group](group.md)

default physical location for this group's events